import { Injectable } from '@angular/core';
import { NostrFilter } from '@nostrify/nostrify';
import { IDBPDatabase, openDB } from 'idb';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { InMemoryEventCache } from '../in-memory/in-memory.event-cache';
import { IdbNostrEventCache } from './idb-nostr-event-cache.interface';

/**
 * ncache load from indexeddb and keep it syncronized
 */
@Injectable()
export class IdbEventCache extends InMemoryEventCache {
  
  protected readonly table: 'nostrEvents' = 'nostrEvents';
  protected db: Promise<IDBPDatabase<IdbNostrEventCache>>;

  private timeoutId: number | null = null;
  protected cacheUpdates: Array<{ action: 'add' | 'delete', event: NostrEvent }> = [];
  protected flushTimeout = 1000;

  constructor() {
    super();
    this.db = this.initialize();
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readonly');
      tx.store.getAll().then(all => all.forEach(event => this.indexInMemory(event)));
    });
  }

  protected initialize(): Promise<IDBPDatabase<IdbNostrEventCache>> {
    return openDB<IdbNostrEventCache>('NostrEventCache', 1, {
      upgrade(db) {
        db.createObjectStore('nostrEvents', {
          keyPath: 'id',
          autoIncrement: false
        });
      }
    });
  }

  override add(event: NostrEvent): this {
    const me = super.add(event);
    this.cacheUpdates.push({ action: 'add', event });
    this.flush();

    return me;
  }

  override async remove(filters: NostrFilter[]): Promise<void> {
    const events = await this.query(filters)
    events.forEach(event => this.delete(event));
  }

  override delete(event: NostrEvent): boolean {
    const removed = super.delete(event);
    
    if (removed) {
      this.cacheUpdates.push({ action: 'delete', event });
      this.flush();
    }
    
    return removed;
  }

  private flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.timeoutId = +setTimeout(() => this.patchUpdates(), this.flushTimeout);
  }
  
  /**
   * save changes from memory cache in indexeddb cache
   */
  private patchUpdates(): void {
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readwrite');
      const queeue: Array<Promise<unknown>> = [];

      this.cacheUpdates.forEach(({ action, event }) => {
        if (action === 'add') {
          queeue.push(tx.objectStore(this.table).put(event));
        } else if (action === 'delete') {
          queeue.push(tx.objectStore(this.table).delete(event.id));
        }
      });

      queeue.push(tx.done);
      this.cacheUpdates = [];
      Promise.all(queeue);
    });
  }
}