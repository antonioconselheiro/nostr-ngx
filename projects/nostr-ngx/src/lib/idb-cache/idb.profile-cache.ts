import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { InMemoryProfileCache } from '../in-memory/in-memory.profile-cache';
import { IdbNostrProfileCache } from './idb-nostr-profile.interface';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';

@Injectable()
export class IdbProfileCache extends InMemoryProfileCache {

  protected readonly table: 'nostrProfiles' = 'nostrProfiles';
  protected db: Promise<IDBPDatabase<IdbNostrProfileCache>>;

  private timeoutId: number | null = null;
  protected cacheUpdates: Array<{
    action: 'add', account: AccountRenderable
  } | {
    action: 'delete', account: HexString
  }> = [];
  protected flushTimeout = 1000;

  constructor() {
    super();
    this.db = this.initialize();
    this.loadIndexedToMemory();
  }

  private initialize(): Promise<IDBPDatabase<IdbNostrProfileCache>> {
    const me = this;
    return openDB<IdbNostrProfileCache>('NostrProfileCache', 1, {
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
      tx.store.getAll().then(all => all.forEach(event => this.add(event)));
    });
  }

  override add(account: AccountRenderable): void {
    super.add(account);
    this.cacheUpdates.push({ action: 'add', account: account });
    this.flush();
  }

  override delete(pubkey: HexString): void {
    super.delete(pubkey);
    this.cacheUpdates.push({ action: 'delete', account: pubkey });
    this.flush();
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
    const cacheUpdates = this.cacheUpdates;
    this.cacheUpdates = [];
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readwrite');
      const queeue: Array<Promise<unknown>> = [];

      cacheUpdates.forEach(({ action, account }) => {
        if (action === 'add') {
          queeue.push(tx.objectStore(this.table).put(account));
        } else if (action === 'delete') {
          queeue.push(tx.objectStore(this.table).delete(account));
        }
      });

      queeue.push(tx.done);
      Promise.all(queeue);
    });
  }
}
