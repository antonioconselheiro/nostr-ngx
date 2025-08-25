import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { InMemoryEventCache } from '../in-memory/in-memory.event-cache';
import { IdbNostrEventCache } from './idb-nostr-event.interface';

/**
 * ncache load from indexeddb and keep it syncronized
 */
@Injectable()
export class IdbEventCache extends InMemoryEventCache {
  
  protected readonly table: 'nostrEvents' = 'nostrEvents';
  protected db: Promise<IDBPDatabase<IdbNostrEventCache>>;

  private timeoutId: number | null = null;
  protected cacheUpdates: Array<{
    action: 'add',
    data: NostrEventWithRelays
  } | {
    action: 'delete',
    data: HexString
  }> = [];
  protected flushTimeout = 1000;

  constructor() {
    super();
    this.db = this.initialize();
    this.loadIndexedToMemory();
  }

  private initialize(): Promise<IDBPDatabase<IdbNostrEventCache>> {
    const me = this;
    return openDB<IdbNostrEventCache>('NostrEventCache', 1, {
      upgrade(db) {
        db.createObjectStore(me.table, {
          keyPath: 'id',
          autoIncrement: false
        });
      }
    });
  }

  private loadIndexedToMemory(): void {
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readonly');
      tx.store.getAll().then(all => all.forEach(event => this.indexInMemory(event)));
    });
  }

  override add(origins: NostrEventWithRelays): this {
    const me = super.add(origins);
    this.cacheUpdates.push({ action: 'add', data: origins });
    this.flush();

    return me;
  }

  override async remove(filters: NostrFilter[]): Promise<void> {
    const events = await this.query(filters)
    events.forEach(origins => this.delete(origins.event.id));
  }

  override delete(idEvent: HexString): boolean {
    const removed = super.delete(idEvent);
    
    if (removed) {
      this.cacheUpdates.push({ action: 'delete', data: idEvent });
      this.flush();
    }
    
    return removed;
  }

  private flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.timeoutId = Number(setTimeout(() => this.patchUpdates(), this.flushTimeout));
  }
  
  /**
   * save changes from memory cache in indexeddb cache
   */
  private patchUpdates(): void {
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readwrite');
      const queeue: Array<Promise<unknown>> = [];

      this.cacheUpdates.forEach(({ action, data }) => {
        if (action === 'add') {
          queeue.push(tx.objectStore(this.table).put(data));
        } else if (action === 'delete') {
          queeue.push(tx.objectStore(this.table).delete(data));
        }
      });

      queeue.push(tx.done);
      this.cacheUpdates = [];
      Promise.all(queeue);
    });
  }
}