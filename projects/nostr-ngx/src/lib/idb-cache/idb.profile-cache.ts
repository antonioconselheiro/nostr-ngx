import { Injectable } from '@angular/core';
import { InMemoryProfileCache } from '../in-memory/in-memory.profile-cache';
import { IdbNostrProfileCache } from './idb-nostr-profile-cache.interface';
import { IDBPDatabase, openDB } from 'idb';

@Injectable()
export class IdbProfileCache extends InMemoryProfileCache {

  protected readonly table: 'nostrProfiles' = 'nostrProfiles';
  protected db: Promise<IDBPDatabase<IdbNostrProfileCache>>;

  constructor() {
    super();
    this.db = this.initialize();
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readonly');
      tx.store.getAll().then(all => all.forEach(account => this.add(account)));
    });
  }

  protected initialize(): Promise<IDBPDatabase<IdbNostrProfileCache>> {
    return openDB<IdbNostrProfileCache>('NostrProfileCache', 1, {
      upgrade(db) {
        db.createObjectStore('nostrProfiles', {
          keyPath: 'pubkey',
          autoIncrement: false
        });
      },
    });
  }
}