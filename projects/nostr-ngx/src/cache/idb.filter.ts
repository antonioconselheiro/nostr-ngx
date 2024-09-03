import { Injectable } from '@angular/core';
import { NostrEvent, NostrFilter, NSet } from '@nostrify/nostrify';
import { IDBPDatabase, IDBPTransaction } from 'idb';
import { INostrCache } from './nostr-cache.interface';

@Injectable()
export class IdbFilter {

  static indexableTag = [ 'p', 'e', 't' ];

  async query(db: IDBPDatabase<INostrCache>, filters: NostrFilter[]): Promise<NostrEvent[]> {
    const set = new NSet();
    const txEvent = db.transaction('nostrEvents', 'readonly');
    const txTag = db.transaction('tagIndex', 'readonly');

    for await (const filter of filters) {
      const events = await this.querySingleFilter(filter, txEvent, txTag);
      for await (const event of events) {
        set.add(event);
      }
    }

    await Promise.all([
      txTag.done,
      txEvent.done
    ]);

    return Promise.resolve(Array.from(set));
  }

  //  FIXME: diminui complexidade ciclomático deste método
  // eslint-disable-next-line complexity
  private async *querySingleFilter(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): AsyncIterable<NostrEvent> {
    // eslint-disable-next-line prefer-const
    let { origin, nset } = await this.loadStreamFromBestIndex(filter, txEvent, txTag);
    if (filter.ids && origin !== 'ids') {
      nset = this.filterIds(nset, filter);
    }

    if (filter.authors && origin !== 'authors') {
      nset = this.filterAuthors(nset, filter);
    }

    if (filter.kinds && origin !== 'kinds') {
      nset = this.filterKinds(nset, filter);
    }

    if (filter.search && origin !== 'search') {
      nset = this.filterSearch(nset, filter);
    }

    if (filter.since) {
      nset = this.filterSince(nset, filter);
    }

    if (filter.until) {
      nset = this.filterUntil(nset, filter);
    }

    if (filter.limit) {
      nset = this.filterLimit(nset, filter);
    }

    for (const event of [...nset]) {
      yield event;
    }
  }

  // FIXME: diminuir complexidade ciclomática para este método
  // eslint-disable-next-line complexity
  private async loadStreamFromBestIndex(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<{
    origin: keyof NostrFilter | 'tags',
    nset: NSet
  }> {
    if (this.hasTags(filter)) {
      const nset = await this.loadEventFromTags(filter, txEvent, txTag);
      const origin = 'tags';
      return Promise.resolve({ nset, origin });
    }

    if (filter.ids?.length) {
      const nset = await this.loadEventById(filter, txEvent, txTag);
      const origin = 'ids';
      return Promise.resolve({ nset, origin });
    }

    if (filter.kinds?.length) {
      const nset = await this.loadEventFromKinds(filter, txEvent, txTag);
      const origin = 'kinds';
      return Promise.resolve({ nset, origin });
    }

    if (filter.authors?.length) {
      const nset = await this.loadEventFromAuthor(filter, txEvent, txTag);
      const origin = 'authors';
      return Promise.resolve({ nset, origin });
    }

    if (filter.search?.length) {
      const nset = await this.loadEventSearchTerm(filter, txEvent, txTag);
      const origin = 'search';
      return Promise.resolve({ nset, origin });
    }

    if (filter.since) {
      const nset = await this.loadEventSinceDate(filter, txEvent, txTag);
      const origin = 'since';
      return Promise.resolve({ nset, origin });
    }

    if (filter.until) {
      const nset = await this.loadEventUntilDate(filter, txEvent, txTag);
      const origin = 'until';
      return Promise.resolve({ nset, origin });
    }

    return Promise.resolve({ nset: new NSet(), origin: 'tags' });
  }

  private hasTags(filter: NostrFilter): boolean {
    return !!Object
      .keys(filter)
      .find(key => /^#/.test(key));
  }

  private async loadEventFromTags(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<NSet> {
    const allFoundsIds: Array<Set<string>> = [];
    const tagFilterMatcher = /^#/;
    const tagSearch = Object
      .keys(filter)
      .filter(key => tagFilterMatcher.test(key))
      .map(key => key.replace(tagFilterMatcher, ''))
      .filter(tag => IdbFilter.indexableTag.includes(tag));

    if (tagSearch.length) {
      for await (const tag of tagSearch) {
        const values = filter[`#${tag}`] || [];
        const foundsIds = new Set<string>();

        for await (const value of values) {
          let cursor = await txTag.store.index('tagAndValue').openCursor([ tag, value ]);
          while (cursor) {
            foundsIds.add(cursor.value.eventId);
            cursor = await cursor.continue();
          }
        }
      }
    }

    const intersection = allFoundsIds.reduce((acc, currentSet) => {
      return new Set([...acc].filter(value => currentSet.has(value)));
    }, allFoundsIds[0] || new Set());

    const events = await Promise.all([...intersection].map(idEvent => txEvent.store.get(idEvent)));
    const nset = new NSet();
    events.forEach(event => event && nset.add(event));

    return Promise.resolve(nset);
  }

  private loadEventById(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<NSet> {
    return Promise.resolve(new NSet());
  }

  private loadEventSearchTerm(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<NSet> {
    return Promise.resolve(new NSet());
  }

  private loadEventFromAuthor(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<NSet> {
    return Promise.resolve(new NSet());
  }

  private loadEventFromKinds(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<NSet> {
    return Promise.resolve(new NSet());
  }

  loadEventSinceDate(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<NSet> {
    return Promise.resolve(new NSet());
  }

  loadEventUntilDate(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<NSet> {
    return Promise.resolve(new NSet());
  }

  private filterIds(nset: NSet, filter: NostrFilter): NSet {
    return nset;
  }

  private filterAuthors(nset: NSet, filter: NostrFilter): NSet {
    return nset;
  }

  private filterKinds(nset: NSet, filter: NostrFilter): NSet {
    return nset;
  }

  private filterSearch(nset: NSet, filter: NostrFilter): NSet {
    return nset;
  }

  private filterSince(nset: NSet, filter: NostrFilter): NSet {
    return nset;
  }

  private filterUntil(nset: NSet, filter: NostrFilter): NSet {
    return nset;
  }

  private filterLimit(nset: NSet, filter: NostrFilter): NSet {
    return nset;
  }
}