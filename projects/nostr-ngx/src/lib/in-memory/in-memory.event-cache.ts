import { Injectable } from "@angular/core";
import { LRUCache } from "lru-cache";
import { matchFilters } from "nostr-tools";
import { HexString } from "../domain/event/primitive/hex-string.type";
import { NCache } from "../domain/nostrify/ncache.type";
import { NostrFilter } from "../domain/nostrify/nostr-filter.type";
import { NostrSet } from "../domain/nostrify/nostr-set.type";
import { indexNotFound } from "../domain/symbol/index-not-found.const";
import { NostrEventOrigins } from "../domain/event/nostr-event-origins.interface";

//  TODO: include index by create at
//  TODO: include index by tag
//  TODO: exclude user config events (0, 10002, 10006, 10007, 10050)

@Injectable()
export class InMemoryEventCache extends NCache {

  private readonly InMemoryIndexExceptionSymbol = Symbol('InMemoryIndexExceptionSymbol');
  private kindIndex = new Map<number, Array<HexString>>();
  private authorIndex = new Map<HexString, Array<HexString>>();
  
  constructor() {
    super(new LRUCache<HexString, NostrEventOrigins>({
      //  TODO: make this configurable
      max: 5000,
      dispose: event => this.delete(event)
    }));
  }

  get(idEvent: HexString): NostrEventOrigins | null {
    return this.cache.get(idEvent) || null;
  }

  override async query(filters: NostrFilter[]): Promise<NostrEventOrigins[]> {
    return Promise.resolve(this.syncQuery(filters));
  }

  syncQuery(filters: NostrFilter[]): NostrEventOrigins[] {
    if (this.shouldLoadFromIndex(filters)) {

      const nset = new NostrSet();
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

  private queryAll(filters: NostrFilter[]): NostrEventOrigins[] {
    const events = new Array<NostrEventOrigins>();

    for (const origins of this) {
      if (matchFilters(filters, origins.event)) {
        //  restart cache timeout
        this.cache.get(origins.event.id);
        events.push(origins);
      }
    }

    return events;
  }

  private querySingleFilter(filter: NostrFilter, nset: NostrSet): void {
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
      .filter((origins): origins is NostrEventOrigins => origins && matchFilters([filter], origins.event) || false)
      .forEach(event => {
        if (filter.limit && filter.limit > nset.size) {
          nset.add(event);
        }
      });
  }

  protected indexInMemory(origins: NostrEventOrigins): this {
    const indexedByKind = this.kindIndex.get(origins.event.kind) || [];
    const indexedByAuthor = this.authorIndex.get(origins.event.pubkey) || [];

    indexedByKind.push(origins.event.id);
    indexedByAuthor.push(origins.event.id);

    this.kindIndex.set(origins.event.kind, indexedByKind);
    this.authorIndex.set(origins.event.pubkey, indexedByAuthor);

    return this.add(origins);
  }

  private shouldLoadFromIndex(filters: NostrFilter[]): boolean {
    const shouldNot = filters
      .map(filter => !!(filter.ids?.length || filter.kinds?.length || filter.authors?.length))
      //  if there one filter with no indexed property I will need loop everything anyway, so the other filter indexes are ignored
      .find(isIndexed => !isIndexed);

    return !shouldNot;
  }

  override delete(origins: NostrEventOrigins): boolean {
    const removed = super.delete(origins);

    if (removed) {
      const indexedByKind = this.kindIndex.get(origins.event.kind) || [];
      const indexedByAuthor = this.authorIndex.get(origins.event.pubkey) || [];

      const indexOfByKind = indexedByKind.indexOf(origins.event.id);
      if (indexOfByKind !== indexNotFound) {
        indexedByKind.splice(indexOfByKind, 1);
      }

      if (!indexedByKind.length) {
        this.kindIndex.delete(origins.event.kind);
      }

      const indexOfByAuthor = indexedByAuthor.indexOf(origins.event.id);
      if (indexOfByAuthor !== indexNotFound) {
        indexedByAuthor.splice(indexOfByAuthor, 1);
      }

      if (!indexedByAuthor.length) {
        this.authorIndex.delete(origins.event.pubkey);
      }
    }

    return removed;
  }
}