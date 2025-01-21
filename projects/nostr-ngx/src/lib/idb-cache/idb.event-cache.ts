import { Injectable } from '@angular/core';
import { NostrFilter } from '@nostrify/nostrify';
import { IDBPDatabase, openDB } from 'idb';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { InMemoryEventCache } from '../in-memory/in-memory.event-cache';
import { IdbNostrEventCache } from './idb-nostr-event-cache.interface';

/**
 * ncache load from indexeddb and keep it syncronized
 */
@Injectable({
  providedIn: 'root'
})
export class IdbEventCache extends InMemoryEventCache {
  
  protected readonly table: 'nostrEvents' = 'nostrEvents';
  protected db: Promise<IDBPDatabase<IdbNostrEventCache>>;

  constructor() {
    super();
    this.db = this.initialize();
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readonly');
      tx.store.getAll().then(all => all.forEach(event => this.indexInMemory(event)));
    })
  }

  protected initialize(): Promise<IDBPDatabase<IdbNostrEventCache>> {
    return openDB<IdbNostrEventCache>('NostrEventCache', 1, {
      upgrade(db) {
        db.createObjectStore('nostrEvents', {
          keyPath: 'id',
          autoIncrement: false
        });
      },
    });
  }

  override add(event: NostrEvent): this {
    const me = super.add(event);

    //  FIXME: mover para um web worker?
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readwrite');
      Promise.all([
        tx.objectStore(this.table).put(event),
        tx.done
      ]);
    });

    return me;
  }

  override async remove(filters: NostrFilter[]): Promise<void> {
    const events = await this.query(filters)
    events.forEach(event => this.delete(event));
  }

  override delete(event: NostrEvent): boolean {
    const removed = super.delete(event);

    if (removed) {
      //  FIXME: verificar se faz sentido incluir um webworker para fazer a escrita no indexeddb
      this.db.then(db => {
        const tx = db.transaction(this.table, 'readwrite');
        tx.store.delete(event.id);
      });
    }

    return removed;
  }
}