import { Injectable } from '@angular/core';
import { NSchema as n, NostrMetadata } from '@nostrify/nostrify';
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { LRUCache } from 'lru-cache';
import { nip19, NostrEvent } from 'nostr-tools';
import { Nip05 } from '../domain/nip05.type';
import { NPub } from '../domain/npub.type';
import { NostrGuard } from '../nostr/nostr.guard';
import { IdbProfileCache } from './idb-profile-cache.interface';
import { NostrMetadataCached } from './nostr-metadata-cached.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileCache {

  protected readonly table: 'profileMetadata' = 'profileMetadata';

  //  in memory index, map nip5 to pubkey
  protected indexedByNip5 = new Map<string, string>();
  protected db: Promise<IDBPDatabase<IdbProfileCache>>;
  protected cache = new LRUCache<string, NostrMetadataCached>({
    max: 1000,
    dispose: metadata => this.onLRUDispose(metadata),
    updateAgeOnGet: true
  });

  constructor(
    protected guard: NostrGuard
  )  {
    this.db = this.initialize();
    this.load(this.db);
  }

  private initialize(): Promise<IDBPDatabase<IdbProfileCache>> {
    const profileCache = this;
    return openDB<IdbProfileCache>('NostrProfileCache', 1, {
      upgrade(db) {
        const profileMetadata = db.createObjectStore(profileCache.table);
        profileMetadata.createIndex('pubkey', 'pubkey', { unique: true });
      }
    });
  }

  private async load(db: Promise<IDBPDatabase<IdbProfileCache>>): Promise<void> {
    const conn = await db;
    const tx = conn.transaction(this.table, 'readonly');
    const all = await tx.store.getAll();

    all.forEach(resultset => this.cache.set(resultset.pubkey, {
      ...resultset.metadata,
      pubkey: resultset.pubkey
    }));

    return Promise.resolve();
  }

  protected async onLRUDispose(metadata: NostrMetadataCached): Promise<void> {
    //  FIXME: verificar se faz sentido incluir um webworker para fazer a escrita no indexeddb
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    tx.store.delete(metadata.pubkey);
  }

  async add(metadataEvents: Array<NostrEvent & { kind: 0 }>): Promise<Array<[NostrMetadata, NostrEvent & { kind: 0 }]>> {
    //  FIXME: verificar se faz sentido incluir um webworker para fazer a escrita no indexeddb
    const db = await this.db;
    const tx = db.transaction(this.table, 'readwrite');
    const queue = metadataEvents.map(event => this.addSingle(event, tx));
    
    const metadatas = await Promise.all(queue);
    await tx.done;

    return Promise.resolve(metadatas);
  }

  protected async addSingle(
    metadataEvent: NostrEvent & { kind: 0 },
    tx:  IDBPTransaction<IdbProfileCache, ["profileMetadata"], "readwrite">
  ): Promise<[NostrMetadata, NostrEvent & { kind: 0 }]> {
    const metadata = n.json().pipe(n.metadata()).parse(metadataEvent.content);
    this.cache.set(metadataEvent.pubkey, {
      ...metadata,
      pubkey: metadataEvent.pubkey
    });

    if (metadata.nip05) {
      this.indexedByNip5.set(metadata.nip05, metadataEvent.pubkey);
    }

    await tx.store.put({
      pubkey: metadataEvent.pubkey,
      metadata
    });

    return Promise.resolve([metadata, metadataEvent]);
  }
  
  get(pubkey: string): NostrMetadata | null;
  get(pubkeys: string[]): NostrMetadata[];
  get(npub: NPub): NostrMetadata | null;
  get(npubs: NPub[]): NostrMetadata[];
  get(publicAddresses: string[] | string): NostrMetadata | NostrMetadata[] | null;
  get(publicAddresses: string[] | string): NostrMetadata | NostrMetadata[] | null {
    publicAddresses = publicAddresses instanceof Array ? publicAddresses : [ publicAddresses ];
    const metadatas = publicAddresses
      .map(publicAddress => this.castPublicAddressToPubkey(publicAddress))
      .map(pubkey => pubkey && this.cache.get(pubkey) || null)
      .filter((metadata): metadata is NostrMetadataCached => !!metadata)
      .map((cached: Partial<NostrMetadataCached>): NostrMetadata => {
        delete cached.pubkey;
        return cached;
      });

    if (publicAddresses instanceof Array) {
      return metadatas;
    } else {
      return metadatas[0] || null;
    }
  }

  getByNip5(nip5: Nip05): NostrMetadata | null;
  getByNip5(nip5s: Nip05[]): NostrMetadata[];
  getByNip5(nip5s: Nip05 | Nip05[]): NostrMetadata[] | NostrMetadata | null {
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
