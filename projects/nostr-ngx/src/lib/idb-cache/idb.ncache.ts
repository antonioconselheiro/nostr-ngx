import { NCache, NostrFilter, NSet } from '@nostrify/nostrify';
import { IDBPDatabase, openDB } from 'idb';
import { matchFilters } from 'nostr-tools';
import { IdbNostrEventCache } from './idb-nostr-event-cache.interface';
import { NostrEvent } from '../domain/nostr-event.interface';
import { HexString } from '../domain/hex-string.interface';

//  TODO: include index by create at
//  TODO: include index by tag
//  TODO: include exclusive cache for user config events (0, 10002, 10006, 10007, 10050), other events will change fast in lru, but these must be keep for more time with exclusive memory map
//  TODO: include default fallback for:
//  - search Profiles,
//  - search event JustIds,
//  - UserSearchRelays, maybe these are best relays to search for users
//  - NoteSearchRelays, maybe these are best relays to search for publications
//  - FallbackRelays, for general porpouse
/**
 * ncache load from indexeddb and keep it syncronized
 */
export class IdbNCache extends NCache {

  readonly InMemoryIndexExceptionSymbol = Symbol('InMemoryIndexExceptionSymbol');
  protected readonly table: 'nostrEvents' = 'nostrEvents';
  protected db: Promise<IDBPDatabase<IdbNostrEventCache>>;

  private kindIndex = new Map<number, Array<HexString>>();
  private authorIndex = new Map<HexString, Array<HexString>>();

  constructor() {
    super({
      max: 5000,
      dispose: event => this.delete(event)
    });
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
    const me = this.indexInMemory(event);

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

  protected indexInMemory(event: NostrEvent): this {
    const indexedByKind = this.kindIndex.get(event.kind) || [];
    const indexedByAuthor = this.authorIndex.get(event.pubkey) || [];

    indexedByKind.push(event.id);
    indexedByAuthor.push(event.id);

    this.kindIndex.set(event.kind, indexedByKind);
    this.authorIndex.set(event.pubkey, indexedByAuthor);

    return super.add(event);
  }

  override async query(filters: NostrFilter[]): Promise<NostrEvent[]> {
    if (this.shouldLoadFromIndex(filters)) {

      const nset = new NSet();
      try {
        filters.map(filter => this.querySingleFilter(filter, nset));
      } catch (e) {
        if (e === this.InMemoryIndexExceptionSymbol) {
          return super.query(filters);
        } else {
          throw e;
        }
      }
      return Array.from(nset);
    } else {

      return super.query(filters);
    }
  }

  private shouldLoadFromIndex(filters: NostrFilter[]): boolean {
    const shouldNot = filters
      .map(filter => !!(filter.ids?.length || filter.kinds?.length || filter.authors?.length))
      //  if there one filter with no indexed property I will need loop everything anyway, so the other filter indexes are ignored
      .find(isIndexed => !isIndexed);

    return !shouldNot;
  }

  private querySingleFilter(filter: NostrFilter, nset: NSet): void {
    let ids: HexString[] = [];
    if (filter.ids?.length) {
      ids = filter.ids;
    } else if (filter.kinds?.length) {
      ids = filter.kinds.map(kind => this.kindIndex.get(kind) || []).flat(2);
    } else if (filter.authors?.length) {
      ids = filter.authors.map(author => this.authorIndex.get(author) || []).flat(2);
    } else {
      //  shouldLoadFromIndex should garantee this will never happen, but we never know
      throw this.InMemoryIndexExceptionSymbol;
    }

    ids
      .map(id => this.cache.get(id))
      .filter((event): event is NostrEvent => event && matchFilters([filter], event) || false)
      .forEach(event => {
        if (filter.limit && filter.limit > nset.size) {
          nset.add(event);
        }
      });
  }

  override async remove(filters: NostrFilter[]): Promise<void> {
    const events = await this.query(filters)
    events.forEach(event => this.delete(event));
  }

  override delete(event: NostrEvent): boolean {
    const removed = super.delete(event);

    if (removed) {
      const indexNotFound = -1;
      const indexedByKind = this.kindIndex.get(event.kind) || [];
      const indexedByAuthor = this.authorIndex.get(event.pubkey) || [];

      const indexOfByKind = indexedByKind.indexOf(event.id);
      if (indexOfByKind !== indexNotFound) {
        indexedByKind.splice(indexOfByKind, 1);
      }

      if (!indexedByKind.length) {
        this.kindIndex.delete(event.kind);
      }

      const indexOfByAuthor = indexedByAuthor.indexOf(event.id);
      if (indexOfByAuthor !== indexNotFound) {
        indexedByAuthor.splice(indexOfByAuthor, 1);
      }

      if (!indexedByAuthor.length) {
        this.authorIndex.delete(event.pubkey);
      }
    }

    //  FIXME: verificar se faz sentido incluir um webworker para fazer a escrita no indexeddb
    this.db.then(db => {
      const tx = db.transaction(this.table, 'readwrite');
      tx.store.delete(event.id);
    });

    return removed;
  }
}