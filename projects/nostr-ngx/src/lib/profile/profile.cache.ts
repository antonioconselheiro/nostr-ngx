import { Injectable } from '@angular/core';
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { LRUCache } from 'lru-cache';
import { nip19 } from 'nostr-tools';
import { Nip05 } from 'nostr-tools/nip05';
import { NPub } from 'nostr-tools/nip19';
import { AccountCacheable } from '../domain/account/compose/account-cacheable.type';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountViewable } from '../domain/account/account-viewable.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrGuard } from '../nostr-utils/nostr.guard';
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

  //  FIXME: devo refletir sobre um meio das contas autenticáveis não ficarem neste cache,
  //  já que estão guardadas no storage, se não será duplicação de dados em cache
  /**
   * this cache include fully loaded account data, including profile and banner images in base64
   */
  protected cacheAccountComplete = new LRUCache<string, AccountComplete>({
    max: 7,
    //  TODO: como a quantidade de itens aqui é bem menor que o cache geral, os perfis em cache irão mudar com maior frequência,
    //  minha ideia então é envia-los ao cache maior (cacheAccount) sem as propriedades de perfil e banner em base64, removendo
    //  essas propriedades também do cache persistente (idbindex)
    dispose: account => this.fowardToCommonCache(account),
    updateAgeOnGet: true
  });

  /**
   * this cache include all loaded account data and profile image base64, this account data are ready to be rendered in the document
   */
  protected cacheAccountViewable = new LRUCache<string, AccountViewable>({
    max: 70,
    //  TODO: como a quantidade de itens aqui é bem menor que o cache geral, os perfis em cache irão mudar com maior frequência,
    //  minha ideia então é envia-los ao cache maior (cacheAccount) sem as propriedades de perfil e banner em base64, removendo
    //  essas propriedades também do cache persistente (idbindex)
    dispose: account => this.fowardToCommonCache(account),
    updateAgeOnGet: true
  });

  /**
   * this cache include all basic account loaded data
   */
  protected cacheAccount = new LRUCache<string, AccountEssential | AccountPointable>({
    max: 1000,
    dispose: account => this.onLRUDispose(account),
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

  //  FIXME: tlvz seja bom incluir logs de debug aqui para identificar se este método está sendo chamado demais
  /**
   * Cache with images have a smaller amount of available space compared to cache without images,
   * because the object for the image cache includes base64 images.
   *
   * This method removes the images from an expired account and then saves it in the cache with no images.
   */
  protected async fowardToCommonCache(account: AccountComplete | AccountViewable): Promise<void> {
    const {
      pubkey,
      npub,
      nprofile,
      nip05,
      metadata,
      displayName,
      relays
    } = account;

    const pointable: AccountPointable = {
      pubkey,
      npub,
      nprofile,
      state: 'pointable',
      nip05,
      metadata,
      displayName,
      relays
    };

    this.cacheAccount.set(pointable.pubkey, pointable);
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    tx.store.delete(pointable.pubkey);
    await this.addSingle(pointable, tx);
    await tx.done;
  }

  //  FIXME: tlvz seja bom incluir logs de debug aqui para identificar se este método está sendo chamado demais
  protected async onLRUDispose(account: AccountCacheable): Promise<void> {
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    tx.store.delete(account.pubkey);
    if (account.metadata?.nip05) {
      this.indexedByNip05.delete(account.metadata.nip05);
    }
  }

  //  FIXME: tlvz seja bom incluir logs de debug aqui para identificar se este método está sendo chamado demais
  async add(accounts: Array<AccountCacheable>): Promise<Array<AccountCacheable>> {
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    const queue = accounts.map(touple => this.addSingle(touple, tx));

    const metadatas = await Promise.all(queue);
    await tx.done;

    return Promise.resolve(metadatas);
  }

  protected async addSingle(
    account: AccountCacheable,
    tx: IDBPTransaction<IdbAccountCache, ["accounts"], "readwrite">
  ): Promise<AccountCacheable> {
    const { pubkey, metadata } = account;

    //  save in lru cache
    if (account.state === 'essential' || account.state === 'pointable') {
      this.cacheAccount.set(pubkey, account);
    } else if (account.state === 'viewable') {
      this.cacheAccountViewable.set(pubkey, account);
    } else if (account.state === 'complete') {
      this.cacheAccountComplete.set(pubkey, account);
    }

    //  bind nip05 to pubkey
    if (metadata && metadata.nip05) {
      this.indexedByNip05.set(metadata.nip05, pubkey);
    }

    await tx.objectStore(this.table).put(account);
    return account;
  }

  get(pubkey: HexString): AccountCacheable | null;
  get(pubkeys: HexString[]): AccountCacheable[];
  get(npub: NPub): AccountCacheable | null;
  get(npubs: NPub[]): AccountCacheable[];
  get(publicAddresses: string[] | string): AccountCacheable | AccountCacheable[] | null;
  get(publicAddresses: string[] | string): AccountCacheable | AccountCacheable[] | null {
    publicAddresses = publicAddresses instanceof Array ? publicAddresses : [publicAddresses];
    const metadatas = publicAddresses
      .map(publicAddress => this.castPublicAddressToPubkey(publicAddress))
      .map(pubkey => pubkey && (
        this.cacheAccountComplete.get(pubkey) ||
        this.cacheAccountViewable.get(pubkey) ||
        this.cacheAccount.get(pubkey)) || null
      )
      .filter((metadata): metadata is AccountCacheable => !!metadata);

    if (publicAddresses instanceof Array) {
      return metadatas;
    } else {
      return metadatas[0] || null;
    }
  }

  getByNip05(nip05: Nip05): AccountCacheable | null;
  getByNip05(nip05s: Nip05[]): AccountCacheable[];
  getByNip05(nip05s: Nip05 | Nip05[]): AccountCacheable[] | AccountCacheable | null {
    if (nip05s instanceof Array) {
      nip05s
        .map(nip05 => this.indexedByNip05.get(nip05))
        .map(pubkey => pubkey && this.get(pubkey) || null)
        .filter(metadata => !!metadata);
    } else {
      const pubkey = this.indexedByNip05.get(nip05s);
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
