import { Injectable } from '@angular/core';
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { LRUCache } from 'lru-cache';
import { nip19 } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { Nip05 } from 'nostr-tools/nip05';
import { NPub } from 'nostr-tools/nip19';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountViewable } from '../domain/account/account-viewable.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { AccountResultset } from './account-resultset.type';
import { IdbAccountCache } from './idb-account-cache.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileCache {

  protected readonly table: 'accounts' = 'accounts';

  //  in memory index, map nip5 to pubkey
  //  getAll data from indexeddb is fastast option, then I index these data in memory
  protected indexedByNip05 = new Map<string, string>();
  protected db: Promise<IDBPDatabase<IdbAccountCache>>;

  /**
   * this cache include fully loaded account data, including profile and banner images in base64
   */
  protected cacheAccountComplete = new LRUCache<string, AccountComplete>({
    max: 7,
    dispose: account => this.onLRUDisposeComplete(account),
    updateAgeOnGet: true
  });

  /**
   * this cache include all loaded account data and profile image base64, this account data are ready to be rendered in the document
   */
  protected cacheAccountViewable = new LRUCache<string, AccountViewable>({
    max: 40,
    dispose: account => this.onLRUDisposeViewable(account),
    updateAgeOnGet: true
  });

  /**
   * this cache include all basic account loaded data 
   */
  protected cacheAccount = new LRUCache<string, AccountEssential | AccountPointable>({
    max: 1000,
    dispose: account => this.onLRUDisposeEssentialAndPointable(account),
    updateAgeOnGet: true
  });

  constructor(
    protected guard: NostrGuard
  ) {
    this.db = this.initialize();
    this.load(this.db);
  }

  private initialize(): Promise<IDBPDatabase<IdbAccountCache>> {
    const profileCache = this;
    return openDB<IdbAccountCache>('NostrProfileCache', 1, {
      upgrade(db) {
        db.createObjectStore(profileCache.table, {
          keyPath: 'pubkey',
          autoIncrement: false
        });
      }
    });
  }

  private async load(db: Promise<IDBPDatabase<IdbAccountCache>>): Promise<void> {
    const conn = await db;
    const tx = conn.transaction(this.table, 'readonly');
    const all = await tx.store.getAll();

    all.forEach(resultset => {
      if (resultset.state === 'complete') {
        this.cacheAccountComplete.set(resultset.pubkey, resultset);
      } else if (resultset.state === 'viewable') {
        this.cacheAccountViewable.set(resultset.pubkey, resultset);
      } else {
        this.cacheAccount.set(resultset.pubkey, resultset);
      }
    });

    return Promise.resolve();
  }

  protected async onLRUDisposeEssentialAndPointable(account: AccountEssential | AccountPointable): Promise<void> {

  }

  protected async onLRUDisposeViewable(account: AccountViewable): Promise<void> {

  }

  protected async onLRUDisposeComplete(account: AccountComplete): Promise<void> {

  }

  protected async onLRUDispose(metadata: AccountResultset): Promise<void> {
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    tx.store.delete(metadata.pubkey);
  }

  async add(metadataEvents: Array<NostrEvent<Metadata>>): Promise<Array<AccountResultset>> {
    const touples = await this.prefetch(metadataEvents);
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    const queue = touples.map(touple => this.addSingle(touple, tx));

    const metadatas = await Promise.all(queue);
    await tx.done;

    return Promise.resolve(metadatas);
  }

  protected async addSingle(
    resultset: AccountEssential | AccountPointable | AccountViewable | AccountComplete,
    tx: IDBPTransaction<IdbAccountCache, ["accounts"], "readwrite">
  ): Promise<AccountEssential | AccountPointable | AccountViewable | AccountComplete> {
    const { pubkey, metadata } = resultset;

    //  save in lru cache
    this.cache.set(pubkey, resultset);

    //  bind nip05 to pubkey
    if (metadata && metadata.nip05) {
      this.indexedByNip05.set(metadata.nip05, pubkey);
    }

    await tx.objectStore(this.table).put(resultset);
    return resultset;
  }

  get(pubkey: HexString): AccountResultset | null;
  get(pubkeys: HexString[]): AccountResultset[];
  get(npub: NPub): AccountResultset | null;
  get(npubs: NPub[]): AccountResultset[];
  get(publicAddresses: string[] | string): AccountResultset | AccountResultset[] | null;
  get(publicAddresses: string[] | string): AccountResultset | AccountResultset[] | null {
    publicAddresses = publicAddresses instanceof Array ? publicAddresses : [publicAddresses];
    const metadatas = publicAddresses
      .map(publicAddress => this.castPublicAddressToPubkey(publicAddress))
      .map(pubkey => pubkey && this.cache.get(pubkey) || null)
      .filter((metadata): metadata is AccountResultset => !!metadata);

    if (publicAddresses instanceof Array) {
      return metadatas;
    } else {
      return metadatas[0] || null;
    }
  }

  getByNip5(nip5: Nip05): AccountResultset | null;
  getByNip5(nip5s: Nip05[]): AccountResultset[];
  getByNip5(nip5s: Nip05 | Nip05[]): AccountResultset[] | AccountResultset | null {
    if (nip5s instanceof Array) {
      nip5s
        .map(nip5 => this.indexedByNip05.get(nip5))
        .map(pubkey => pubkey && this.get(pubkey) || null)
        .filter(metadata => !!metadata);
    } else {
      const pubkey = this.indexedByNip05.get(nip5s);
      if (pubkey) {
        return this.get(pubkey);
      }
    }

    return null;
  }

  private castPublicAddressToPubkey(publicAddress: string): string | null {
    if (this.guard.isNPub(publicAddress)) {

      const { data } = nip19.decode(publicAddress);
      return data;
    } else if (this.guard.isHexadecimal(publicAddress)) {
      return publicAddress;
    }

    return null;
  }
}
