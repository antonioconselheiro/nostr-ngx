import { Injectable } from '@angular/core';
import { NKinds, NostrEvent, NostrFilter, NStore } from '@nostrify/nostrify';
import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { IdbFilter } from './idb.filter';
import { IdbNostrEventCache } from './idb-nostr-event-cache.interface';

/**
 * FIXME: pendente de escrever lógica para controlar tamanho máximo do indexeddb
 * FIXME: preciso escrever testes unitários para essa classe e validar o funcionamento
 */
@Injectable()
export class IdbNStore implements NStore {

  protected db: Promise<IDBPDatabase<IdbNostrEventCache>>;

  constructor(
    protected nostrCacheFilter: IdbFilter
  ) {
    this.db = this.initialize();
  }

  protected initialize(): Promise<IDBPDatabase<IdbNostrEventCache>> {
    return openDB<IdbNostrEventCache>('NostrEventCache', 1, {
      upgrade(db) {
        const eventCache = db.createObjectStore('nostrEvents', {
          keyPath: 'id',
          autoIncrement: false
        });

        eventCache.createIndex('pubkey', 'pubkey', { unique: false });
        eventCache.createIndex('kind', 'kind', { unique: false });
        eventCache.createIndex('content', 'content', { unique: false });
        eventCache.createIndex('created_at', 'created_at', { unique: false });

        const tagIndex = db.createObjectStore('tagIndex', {
          keyPath: 'key',
          autoIncrement: true
        });

        tagIndex.createIndex('tagAndValue', [ 'tag', 'value' ], { unique: false });
        tagIndex.createIndex('tag', 'tag', { unique: false });
        tagIndex.createIndex('eventId', 'eventId', { unique: false });
      },
    });
  }

  async event(event: NostrEvent): Promise<void> {
    if (NKinds.ephemeral(event.kind)) {
      return Promise.resolve();
    }
    
    //  FIXME: incluir num web worker?
    const db = await this.db;
    const txEvent = db.transaction('nostrEvents', 'readwrite');
    const txTag = db.transaction('tagIndex', 'readwrite');

    await Promise.all([
      txEvent.store.put(event),
      this.indexTagsToEvent(event, txTag),
      txEvent.done,
      txTag.done
    ]);
  }

  private async indexTagsToEvent(event: NostrEvent, txTag: IDBPTransaction<IdbNostrEventCache, ["tagIndex"], "readwrite">): Promise<void> {
    for await (const tag of event.tags) {
      const [ type, value ] = tag;
      if (IdbFilter.indexableTag.includes(type)) {
        await txTag.store.put({
          key: undefined as any as number, // ¯\_(ツ)_/¯ autoincrement
          tag: type,
          value,
          eventId: event.id
        });
      }
    }
  }

  async query(filters: NostrFilter[]): Promise<NostrEvent[]> {
    const db = await this.db;
    return this.nostrCacheFilter.query(db, filters);
  }

  /**
   * prefer use query(), this is just a query().length
   */
  async count(filters: NostrFilter[]): Promise<{ count: number }> {
    console.warn('Usage of IdbNStore.count, prefer use query(), ' +
        'for this indexeddb impl this method is just a query().length');
    const events = await this.query(filters);
    return Promise.resolve({ count: events.length });
  }

  async remove(filters: NostrFilter[]): Promise<void> {
    const db = await this.db;
    //  FIXME: incluir num web worker?
    return await this.nostrCacheFilter.delete(db, filters);
  }
}