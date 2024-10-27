import { Injectable } from '@angular/core';
import { NSchema as n } from '@nostrify/nostrify';
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { LRUCache } from 'lru-cache';
import { nip19 } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { Nip05, queryProfile } from 'nostr-tools/nip05';
import { NPub, ProfilePointer } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { AccountResultset } from './account-resultset.type';
import { IdbProfileCache } from './idb-profile-cache.interface';
import { HexString } from '../domain/event/hex-string.type';

@Injectable({
  providedIn: 'root'
})
export class ProfileCache {

  protected readonly table: 'profileMetadata' = 'profileMetadata';

  //  in memory index, map nip5 to pubkey
  //  getAll data from indexeddb is fastast option, then I index these data in memory
  protected indexedByNip5 = new Map<string, string>();
  protected db: Promise<IDBPDatabase<IdbProfileCache>>;
  protected cache = new LRUCache<string, AccountResultset>({
    max: 1000,
    dispose: metadata => this.onLRUDispose(metadata),
    updateAgeOnGet: true
  });

  constructor(
    protected guard: NostrGuard
  ) {
    this.db = this.initialize();
    this.load(this.db);
  }

  private initialize(): Promise<IDBPDatabase<IdbProfileCache>> {
    const profileCache = this;
    return openDB<IdbProfileCache>('NostrProfileCache', 1, {
      upgrade(db) {
        db.createObjectStore(profileCache.table, {
          keyPath: 'pubkey',
          autoIncrement: false
        });
      }
    });
  }

  private async load(db: Promise<IDBPDatabase<IdbProfileCache>>): Promise<void> {
    const conn = await db;
    const tx = conn.transaction(this.table, 'readonly');
    const all = await tx.store.getAll();

    all.forEach(resultset => this.cache.set(resultset.pubkey, resultset));

    return Promise.resolve();
  }

  protected async onLRUDispose(metadata: AccountResultset): Promise<void> {
    //  FIXME: verificar se faz sentido incluir um webworker para fazer a escrita no indexeddb
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    tx.store.delete(metadata.pubkey);
  }

  async add(metadataEvents: Array<NostrEvent<Metadata>>): Promise<Array<AccountResultset>> {
    const touples = await this.prefetch(metadataEvents);
    //  FIXME: verificar se faz sentido incluir um webworker para fazer a escrita no indexeddb
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    const queue = touples.map(touple => this.addSingle(touple, tx));

    const metadatas = await Promise.all(queue);
    await tx.done;

    return Promise.resolve(metadatas);
  }

  protected async prefetch(metadataEvents: Array<NostrEvent<Metadata>>): Promise<Array<AccountResultset>> {
    const queuee = metadataEvents.map(async (event): Promise<AccountResultset> => {
      const metadata = n
        .json()
        .pipe(n.metadata())
        .parse(event.content);
      let nip05Pointer: ProfilePointer | null = null;
      try {
        if (metadata.nip05) {
          nip05Pointer = await queryProfile(metadata.nip05);
        }
      } catch { }

      return {
        pubkey: event.pubkey, event, metadata, nip05: nip05Pointer
      }
    })

    return Promise.all(queuee);
  }

  protected async addSingle(
    resultset: AccountResultset,
    tx: IDBPTransaction<IdbProfileCache, ["profileMetadata"], "readwrite">
  ): Promise<AccountResultset> {
    const { pubkey, event, metadata } = resultset;

    //  save in lru cache
    this.cache.set(pubkey, resultset);

    //  bind nip05 to pubkey
    if (metadata.nip05) {
      this.indexedByNip5.set(metadata.nip05, event.pubkey);
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
        .map(nip5 => this.indexedByNip5.get(nip5))
        .map(pubkey => pubkey && this.get(pubkey) || null)
        .filter(metadata => !!metadata);
    } else {
      const pubkey = this.indexedByNip5.get(nip5s);
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
