import { NCache, NostrEvent, NostrFilter, NSet } from '@nostrify/nostrify';
import { matchFilters } from 'nostr-tools';

export class InMemoryNCache extends NCache {

  readonly InMemoryIndexExceptionSymbol = Symbol('InMemoryIndexExceptionSymbol');

  private kindIndex = new Map<number, Array<string>>();
  private authorIndex = new Map<string, Array<string>>();

  override add(event: NostrEvent): this {
    const indexedByKind = this.kindIndex.get(event.kind) || [];
    const indexedByAuthor = this.authorIndex.get(event.pubkey) || [];

    indexedByKind.push(event.id);
    indexedByAuthor.push(event.id);

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
    let ids: string[] = [];
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
      .forEach((event, i) => {
        if (filter.limit && filter.limit > i) {
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
  
      const indexOfByAuthor = indexedByAuthor.indexOf(event.id);
      if (indexOfByAuthor !== indexNotFound) {
        indexedByAuthor.splice(indexOfByAuthor, 1);
      }
    }

    return removed;
  }
}