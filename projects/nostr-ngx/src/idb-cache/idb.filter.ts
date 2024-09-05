import { Injectable } from '@angular/core';
import { NCache, NostrEvent, NostrFilter } from '@nostrify/nostrify';
import { IDBPCursorWithValue, IDBPDatabase, IDBPTransaction } from 'idb';
import { ncacheDefaultParams } from './ncache-default.params';
import { INostrCache } from './nostr-cache.interface';

@Injectable()
export class IdbFilter {

  static indexableTag = [ 'p', 'e', 't' ]; // it's not 'pet', it's pubkey, event, tag

  async query(db: IDBPDatabase<INostrCache>, filters: NostrFilter[]): Promise<NostrEvent[]> {
    const txEvent = db.transaction('nostrEvents', 'readonly');
    const txTag = db.transaction('tagIndex', 'readonly');

    const events = await this.queryUsingExistingTransactions(filters, txEvent, txTag);

    await Promise.all([
      txTag.done,
      txEvent.done
    ]);

    return Promise.resolve(events);
  }

  async delete(db: IDBPDatabase<INostrCache>, filters: NostrFilter[]): Promise<void> {
    const txEvent = db.transaction('nostrEvents', 'readwrite');
    const txTag = db.transaction('tagIndex', 'readwrite');
    const events = await this.queryUsingExistingTransactions(filters, txEvent, txTag);

    for await (const event of events) {
      await txEvent.store.delete(event.id);
    }

    const tagIndexes = await txTag.store.index('eventId').getAll(IDBKeyRange.only(events.map(event => event.id)));
    for (const tag of tagIndexes) {
      await txTag.store.delete(tag.key);
    }

    await Promise.all([
      txTag.done,
      txEvent.done
    ]);

    return Promise.resolve();
  }

  private async queryUsingExistingTransactions(
    filters: NostrFilter[],
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NostrEvent[]> {
    const ncache = new NCache(ncacheDefaultParams);

    for await (const filter of filters) {
      const events = this.querySingleFilter(filter, txEvent, txTag);
      for await (const event of events) {
        ncache.add(event);
      }
    }

    const results = Array.from(ncache);
    ncache.clear();

    return Promise.resolve(results);
  }

  private async *querySingleFilter(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], IDBTransactionMode>
  ): AsyncIterable<NostrEvent> {
    const ncache = await this.loadStreamFromBestIndex(filter, txEvent, txTag);
    const events = await ncache.query([filter]);

    for (const event of events) {
      yield event;
    }
  }

  // FIXME: diminuir complexidade ciclomática para este método
  // eslint-disable-next-line complexity
  private async loadStreamFromBestIndex(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NCache> {
    if (this.hasTags(filter)) {
      return this.loadEventFromTags(filter, txEvent, txTag);
    }

    if (filter.ids?.length) {
      return this.loadEventById(filter.ids, txEvent);
    }

    if (filter.kinds?.length) {
      return this.loadEventFromKinds(filter.kinds, txEvent);
    }

    if (filter.authors?.length) {
      return this.loadEventFromAuthor(filter.authors, txEvent);
    }

    if (filter.search?.length) {
      return this.loadEventSearchTerm(filter.search, txEvent, txTag);
    }

    if (filter.since) {
      return this.loadEventSinceDate(filter.since, txEvent);
    }

    if (filter.until) {
      return this.loadEventUntilDate(filter.until, txEvent);
    }

    return Promise.resolve(new NCache(ncacheDefaultParams));
  }

  private hasTags(filter: NostrFilter): boolean {
    return !!Object
      .keys(filter)
      .find(key => /^#/.test(key));
  }

  private async loadEventFromTags(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NCache> {
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
    const ncache = new NCache(ncacheDefaultParams);
    events.forEach(event => event && ncache.add(event));

    return Promise.resolve(ncache);
  }

  private async loadEventById(
    eventIdList: string[],
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NCache> {
    const ncache = new NCache(ncacheDefaultParams);
    const queue = eventIdList.map(id => txEvent.store.get(id).then(event => {
      if (event) {
        ncache.add(event);
      }

      return Promise.resolve();
    }));

    await Promise.all(queue);
    return Promise.resolve(ncache);
  }

  private async loadEventSearchTerm(
    searchTherm: string,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NCache> {
    const ncache = new NCache(ncacheDefaultParams);
    const cursor = await txEvent.store.index('content').openCursor(IDBKeyRange.only(searchTherm));
    this.loadCursorEventsToNCache(cursor, ncache);

    const hasNoSpaces = /[^ ]/;
    if (hasNoSpaces.test(searchTherm)) {
      await txTag.store.index('tagAndValue').openCursor([ 't', searchTherm ]);
    }

    return Promise.resolve(ncache);
  }

  private async loadEventFromAuthor(
    filterAuthors: string[],
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NCache> {    
    const ncache = new NCache(ncacheDefaultParams);
    const queue = filterAuthors.map(async pubkey => {
      const cursor = await txEvent.store.index('pubkey').openCursor(pubkey);
      this.loadCursorEventsToNCache(cursor, ncache);
      return Promise.resolve();
    });

    await Promise.all(queue);
    return Promise.resolve(ncache);
  }

  private async loadEventFromKinds(
    filterKinds: number[],
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NCache> {
    const ncache = new NCache(ncacheDefaultParams);
    const queue = filterKinds.map(async kind => {
      const cursor = await txEvent.store.index('kind').openCursor(kind);
      this.loadCursorEventsToNCache(cursor, ncache);
      return Promise.resolve();
    });

    await Promise.all(queue);
    return Promise.resolve(ncache);
  }

  private async loadEventSinceDate(
    since: number,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NCache> {
    const cursor = await txEvent.store.index('created_at').openCursor(IDBKeyRange.upperBound(
      new Date(since * 1000).toISOString()
    ));
    return this.loadCursorEventsToNCache(cursor);
  }

  private async loadEventUntilDate(
    until: number,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NCache> {
    const cursor = await txEvent.store.index('created_at').openCursor(IDBKeyRange.lowerBound(
      new Date(until * 1000).toISOString()
    ));
    return this.loadCursorEventsToNCache(cursor);
  }

  private async loadCursorEventsToNCache(cursor: IDBPCursorWithValue<INostrCache, [any], any> | null, ncache = new NCache(ncacheDefaultParams)): Promise<NCache> {
    while (cursor) {
      if (cursor.value) {
        ncache.add(cursor.value);
      }

      cursor = await cursor.continue();
    }

    return ncache;
  }
}