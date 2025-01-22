import { NCache, NostrFilter, NSet } from "@nostrify/nostrify";
import { NostrEvent } from "../domain/event/nostr-event.interface";
import { HexString } from "../domain/event/primitive/hex-string.type";
import { LRUCache } from "lru-cache";
import { Injectable } from "@angular/core";
import { matchFilters } from "nostr-tools";

//  TODO: include index by create at
//  TODO: include index by tag
//  TODO: exclude user config events (0, 10002, 10006, 10007, 10050)

@Injectable()
export class InMemoryEventCache extends NCache {

  readonly InMemoryIndexExceptionSymbol = Symbol('InMemoryIndexExceptionSymbol');

  private kindIndex = new Map<number, Array<HexString>>();
  private authorIndex = new Map<HexString, Array<HexString>>();
  
  constructor() {
    super(new LRUCache<HexString, NostrEvent>({
      //  TODO: make this configurable
      max: 5000,
      dispose: event => this.delete(event)
    }));
  }

  get(idEvent: HexString): NostrEvent | null {
    return this.cache.get(idEvent) || null;
  }

  override async query(filters: NostrFilter[]): Promise<NostrEvent[]> {
    return Promise.resolve(this.syncQuery(filters));
  }

  syncQuery(filters: NostrFilter[]): NostrEvent[] {
    if (this.shouldLoadFromIndex(filters)) {

      const nset = new NSet();
      try {
        filters.forEach(filter => this.querySingleFilter(filter, nset));
      } catch (e) {
        if (e === this.InMemoryIndexExceptionSymbol) {
          console.warn('InMemoryIndexExceptionSymbol was thrown', this.InMemoryIndexExceptionSymbol);
          return this.queryAll(filters);
        } else {
          throw e;
        }
      }

      return Array.from(nset);
    } else {

      return this.queryAll(filters);
    }
  }

  private queryAll(filters: NostrFilter[]): NostrEvent[] {
    const events: NostrEvent[] = [];

    for (const event of this) {
      if (matchFilters(filters, event)) {
        //  restart cache timeout
        this.cache.get(event.id);
        events.push(event);
      }
    }

    return events;
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
      //  shouldLoadFromIndex method garantee this will never happen, but we never know
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

  protected indexInMemory(event: NostrEvent): this {
    const indexedByKind = this.kindIndex.get(event.kind) || [];
    const indexedByAuthor = this.authorIndex.get(event.pubkey) || [];

    indexedByKind.push(event.id);
    indexedByAuthor.push(event.id);

    this.kindIndex.set(event.kind, indexedByKind);
    this.authorIndex.set(event.pubkey, indexedByAuthor);

    return super.add(event);
  }

  private shouldLoadFromIndex(filters: NostrFilter[]): boolean {
    const shouldNot = filters
      .map(filter => !!(filter.ids?.length || filter.kinds?.length || filter.authors?.length))
      //  if there one filter with no indexed property I will need loop everything anyway, so the other filter indexes are ignored
      .find(isIndexed => !isIndexed);

    return !shouldNot;
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

    return removed;
  }
}