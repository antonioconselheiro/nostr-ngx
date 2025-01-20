import { Injectable } from '@angular/core';
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { LRUCache } from 'lru-cache';
import { nip19 } from 'nostr-tools';
import { Nip05 } from 'nostr-tools/nip05';
import { NPub } from 'nostr-tools/nip19';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { IdbAccountCache } from './idb-account-cache.interface';

//  TODO: pode ser que haja contas disponíveis no local storage com ncryptsec, este serviço deve carrega-los
//  Objetos AccountAuthenticable no geral devem ser enviados para este serviço afim de evitar requisições
//  de dados já disponíveis no client. Este serviço não deve salvar o AccountAuthenticable no idbindex.
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
   * this cache include all basic account loaded data
   */
  protected cacheAccount = new LRUCache<string, AccountRenderable>({
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

    all.forEach(resultset => this.cacheAccount.set(resultset.pubkey, resultset));

    return Promise.resolve();
  }


  //  FIXME: tlvz seja bom incluir logs de debug aqui para identificar se este método está sendo chamado demais
  protected async onLRUDispose(account: AccountRenderable): Promise<void> {
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    tx.store.delete(account.pubkey);
    if (account.metadata?.nip05) {
      this.indexedByNip05.delete(account.metadata.nip05);
    }
  }

  //  FIXME: tlvz seja bom incluir logs de debug aqui para identificar se este método está sendo chamado demais
  async add(accounts: Array<AccountRenderable>): Promise<Array<AccountRenderable>> {
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    const queue = accounts.map(touple => this.addSingle(touple, tx));

    const metadatas = await Promise.all(queue);
    await tx.done;

    return Promise.resolve(metadatas);
  }

  protected async addSingle(
    account: AccountRenderable,
    tx: IDBPTransaction<IdbAccountCache, ["accounts"], "readwrite">
  ): Promise<AccountRenderable> {
    //  accounts with ncryptsec included surely are saved in another place, they should not be included in indexed db
    if (account.state === 'authenticable') {
      return Promise.resolve(account);
    }

    const { pubkey, metadata } = account;

    //  save in lru cache
    this.cacheAccount.set(pubkey, account);

    //  bind nip05 to pubkey
    if (metadata && metadata.nip05) {
      this.indexedByNip05.set(metadata.nip05, pubkey);
    }

    await tx.objectStore(this.table).put(account);
    return account;
  }

  get(pubkey: HexString): AccountRenderable | null;
  get(pubkeys: HexString[]): AccountRenderable[];
  get(npub: NPub): AccountRenderable | null;
  get(npubs: NPub[]): AccountRenderable[];
  get(publicAddresses: string[] | string): AccountRenderable | AccountRenderable[] | null;
  get(publicAddresses: string[] | string): AccountRenderable | AccountRenderable[] | null {
    publicAddresses = publicAddresses instanceof Array ? publicAddresses : [publicAddresses];
    const metadatas = publicAddresses
      .map(publicAddress => this.castPublicAddressToPubkey(publicAddress))
      .map((pubkey): AccountRenderable | null => pubkey && (
        this.cacheAccount.get(pubkey)) || null
      )
      .filter((metadata): metadata is AccountRenderable => !!metadata);

    if (publicAddresses instanceof Array) {
      return metadatas;
    } else {
      return metadatas[0] || null;
    }
  }

  getByNip05(nip05: Nip05): AccountRenderable | null;
  getByNip05(nip05s: Nip05[]): AccountRenderable[];
  getByNip05(nip05s: Nip05 | Nip05[]): AccountRenderable[] | AccountRenderable | null {
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
