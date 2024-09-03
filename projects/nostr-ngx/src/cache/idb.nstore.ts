import { Injectable } from '@angular/core';
import { NKinds, NostrEvent, NostrFilter, NSet, NStore } from '@nostrify/nostrify';
import { IDBPDatabase, openDB } from 'idb';
import { INostrCache } from './nostr-cache.interface';
import { IdbFilter } from './idb.filter';

@Injectable()
export class IdbNStore implements NStore {

  private db: Promise<IDBPDatabase<INostrCache>>;

  constructor(
    private nostrCacheFilter: IdbFilter
  ) {
    this.db = this.initialize();
  }

  initialize(): Promise<IDBPDatabase<INostrCache>> {
    return openDB<INostrCache>('NostrCache', 1, {
      upgrade(db) {
        const eventCache = db.createObjectStore('nostrEvents', {
          keyPath: 'id',
          autoIncrement: false
        });

        eventCache.createIndex('pubkey', 'pubkey', { unique: false });
        eventCache.createIndex('kind', 'kind', { unique: false });
        eventCache.createIndex('content', 'content', { unique: false });
        eventCache.createIndex('since', 'since', { unique: false });
        eventCache.createIndex('until', 'until', { unique: false });

        const tagIndex = db.createObjectStore('tagIndex');
        tagIndex.createIndex('tagAndValue', [ 'tag', 'value' ], { unique: false });
        tagIndex.createIndex('tag', 'tag', { unique: false });

        const profileMetadata = db.createObjectStore('profileMetadata');
        profileMetadata.createIndex('npub', 'npub', { unique: false });
        profileMetadata.createIndex('display_name', 'display_mame', { unique: false });
        profileMetadata.createIndex('name', 'name', { unique: false });
      },
    });
  }

  async event(event: NostrEvent): Promise<void> {
    if (NKinds.ephemeral(event.kind)) {
      return Promise.resolve();
    }

    const db = await this.db;
    const txEvent = db.transaction('nostrEvents', 'readwrite');
    const txTag = db.transaction('tagIndex', 'readwrite');

    await Promise.all([
      txEvent.store.put(event),
      async () => {
        for await (const tag of event.tags) {
          const [ type, value ] = tag;
          if (IdbFilter.indexableTag.includes(type)) {
            await txTag.store.put({
              tag: type,
              value,
              eventId: event.id
            });
          }
        }
      },
      txEvent.done,
      txTag.done
    ]);
  }

  async query(filters: NostrFilter[]): Promise<NostrEvent[]> {
    const db = await this.db;
    return this.nostrCacheFilter.query(db, filters);
  }

  /**
   * prefer use query(), this is just a query().length
   */
  async count(filters: NostrFilter[]): Promise<{ count: number }> {
    const events = await this.query(filters);
    return Promise.resolve({ count: events.length });
  }

  async remove(filters: NostrFilter[]): Promise<void> {
    // Remove events.
  }
}