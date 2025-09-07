import { Injectable } from "@angular/core";
import { LRUCache } from "lru-cache";
import { matchFilters } from "nostr-tools";
import { NostrEventWithRelays } from "../domain/event/nostr-event-with-relays.interface";
import { HexString } from "../domain/event/primitive/hex-string.type";
import { NostrCacheService } from "../pool/nostr-cache.service";
import { NostrFilter } from "../pool/nostr-filter.interface";
import { NostrEventCollection } from "../domain/event/nostr-event.collection";
import { indexNotFound } from "../domain/symbol/index-not-found.const";

//  TODO: include index by tag
//  TODO: exclude user config events (0, 10002, 10006, 10007, 10050)

@Injectable()
export class InMemoryEventCache extends NostrCacheService {

  private readonly InMemoryIndexExceptionSymbol = Symbol('InMemoryIndexExceptionSymbol');
  private kindIndex = new Map<number, Array<HexString>>();
  private authorIndex = new Map<HexString, Array<HexString>>();
  
  constructor() {
    super(new LRUCache<HexString, NostrEventWithRelays>({
      //  TODO: make this configurable
      max: 5000,
      dispose: origins => this.delete(origins.event.id)
    }));
  }

  get(idEvent: HexString): NostrEventWithRelays | null {
    return this.store.get(idEvent) || null;
  }

  override async query(filters: NostrFilter[]): Promise<NostrEventWithRelays[]> {
    return Promise.resolve(this.syncQuery(filters));
  }

  syncQuery(filters: NostrFilter[]): NostrEventWithRelays[] {
    if (this.shouldLoadFromIndex(filters)) {

      const nset = new NostrEventCollection();
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

  private queryAll(filters: NostrFilter[]): NostrEventWithRelays[] {
    const events = new Array<NostrEventWithRelays>();

    for (const origins of this) {
      if (matchFilters(filters, origins.event)) {
        //  restart cache timeout
        this.store.get(origins.event.id);
        events.push(origins);
      }
    }

    return events;
  }

  private querySingleFilter(filter: NostrFilter, nset: NostrEventCollection): void {
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
      .map(id => this.store.get(id))
      .filter((origins): origins is NostrEventWithRelays => origins && matchFilters([filter], origins.event) || false)
      .forEach(event => {
        if (filter.limit && filter.limit > nset.size) {
          nset.add(event);
        }
      });
  }

  protected indexInMemory(origins: NostrEventWithRelays): this {
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

  override delete(eventId: HexString): boolean {
    const deletingEvent = this.get(eventId);
    const removed = super.delete(eventId);

    if (removed && deletingEvent) {
      const indexedByKind = this.kindIndex.get(deletingEvent.event.kind) || [];
      const indexedByAuthor = this.authorIndex.get(deletingEvent.event.pubkey) || [];

      const indexOfByKind = indexedByKind.indexOf(deletingEvent.event.id);
      if (indexOfByKind !== indexNotFound) {
        indexedByKind.splice(indexOfByKind, 1);
      }

      if (!indexedByKind.length) {
        this.kindIndex.delete(deletingEvent.event.kind);
      }

      const indexOfByAuthor = indexedByAuthor.indexOf(deletingEvent.event.id);
      if (indexOfByAuthor !== indexNotFound) {
        indexedByAuthor.splice(indexOfByAuthor, 1);
      }

      if (!indexedByAuthor.length) {
        this.authorIndex.delete(deletingEvent.event.pubkey);
      }
    }

    return removed;
  }
}