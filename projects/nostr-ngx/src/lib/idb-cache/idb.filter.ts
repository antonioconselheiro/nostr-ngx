import { Injectable } from '@angular/core';
import { NCache, NostrEvent, NostrFilter, NSet } from '@nostrify/nostrify';
import { IDBPCursorWithValue, IDBPDatabase, IDBPTransaction } from 'idb';
import { ncacheDefaultParams } from './ncache-default.params';
import { IdbNostrEventCache } from './idb-nostr-event-cache.interface';
import { matchFilter } from 'nostr-tools';

@Injectable()
export class IdbFilter {

  static indexableTag = [ 'p', 'e', 't' ]; // it's not 'pet', it's pubkey, event, tag

  async query(db: IDBPDatabase<IdbNostrEventCache>, filters: NostrFilter[]): Promise<NostrEvent[]> {
    const txEvent = db.transaction('nostrEvents', 'readonly');
    const txTag = db.transaction('tagIndex', 'readonly');

    const events = await this.queryUsingExistingTransactions(filters, txEvent, txTag);

    await Promise.all([
      txTag.done,
      txEvent.done
    ]);

    return Promise.resolve(events);
  }

  async delete(db: IDBPDatabase<IdbNostrEventCache>, filters: NostrFilter[]): Promise<void> {
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
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<IdbNostrEventCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NostrEvent[]> {
    const nset = new NSet();

    const queuee = filters.map(filter => this.querySingleFilter(filter, txEvent, txTag));
    const events = await Promise.all(queuee);

    events.flat(2).forEach(event => nset.add(event));
    const results = Array.from(nset);
    return Promise.resolve(results);
  }

  private async querySingleFilter(
    filter: NostrFilter,
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<IdbNostrEventCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NostrEvent[]> {
    const stream = await this.loadStreamFromBestIndex(filter, txEvent, txTag);
    return this.queryNSet(filter, stream);
  }
  
  async queryNSet(filter: NostrFilter, nset: NSet): Promise<Array<NostrEvent>> {
    const matches = new Array<NostrEvent>();
    Array.from(nset).forEach(event => {
      if (filter.limit && filter.limit > matches.length || !filter.limit) {
        if (matchFilter(filter, event)) {
          matches.push(event);
        }
      }
    });

    return Promise.resolve(matches);
  }

  // FIXME: diminuir complexidade ciclomática para este método
  // eslint-disable-next-line complexity
  private async loadStreamFromBestIndex(
    filter: NostrFilter,
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<IdbNostrEventCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NSet> {
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

  //  TODO: preciso validar se este método está funcionando corretamente
  private async loadEventFromTags(
    filter: NostrFilter,
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<IdbNostrEventCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NSet> {
    const allFoundsIds: Array<Set<string>> = [];
    const tagFilterMatcher = /^#/;
    const tagSearch = Object
      .keys(filter)
      .filter(key => tagFilterMatcher.test(key))
      .map(key => key.replace(tagFilterMatcher, ''))
      .filter(tag => IdbFilter.indexableTag.includes(tag));

    if (tagSearch.length) {
      for (const tag of tagSearch) {
        const values = filter[`#${tag}`] || [];
        const foundsIds = new Set<string>();

        for (const value of values) {
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

  private async loadEventById(
    eventIdList: string[],
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NSet> {
    const nset = new NSet();
    const queue = eventIdList.map(id => txEvent.store.get(id).then(event => {
      if (event) {
        nset.add(event);
      }

      return Promise.resolve();
    }));

    await Promise.all(queue);
    return Promise.resolve(nset);
  }

  private async loadEventSearchTerm(
    searchTherm: string,
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>,
    txTag: IDBPTransaction<IdbNostrEventCache, ["tagIndex"], IDBTransactionMode>
  ): Promise<NSet> {
    const nset = new NSet();
    const cursor = await txEvent.store.index('content').openCursor(IDBKeyRange.only(searchTherm));
    this.loadCursorEventsToNSet(cursor, nset);

    const hasNoSpaces = /[^ ]/;
    if (hasNoSpaces.test(searchTherm)) {
      await txTag.store.index('tagAndValue').openCursor([ 't', searchTherm ]);
    }

    return Promise.resolve(nset);
  }

  private async loadEventFromAuthor(
    filterAuthors: string[],
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NSet> {    
    const nset = new NSet();
    const queue = filterAuthors.map(async pubkey => {
      const cursor = await txEvent.store.index('pubkey').openCursor(pubkey);
      this.loadCursorEventsToNSet(cursor, nset);
      return Promise.resolve();
    });

    await Promise.all(queue);
    return Promise.resolve(nset);
  }

  private async loadEventFromKinds(
    filterKinds: number[],
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NSet> {
    const nset = new NSet();
    const queue = filterKinds.map(async kind => {
      const cursor = await txEvent.store.index('kind').openCursor(kind);
      this.loadCursorEventsToNSet(cursor, nset);
      return Promise.resolve();
    });

    await Promise.all(queue);
    return Promise.resolve(nset);
  }

  private async loadEventSinceDate(
    since: number,
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NSet> {
    const cursor = await txEvent.store.index('created_at').openCursor(IDBKeyRange.upperBound(
      new Date(since * 1000).toISOString()
    ));

    return this.loadCursorEventsToNSet(cursor);
  }

  private async loadEventUntilDate(
    until: number,
    txEvent: IDBPTransaction<IdbNostrEventCache, ["nostrEvents"], IDBTransactionMode>
  ): Promise<NSet> {
    const cursor = await txEvent.store.index('created_at').openCursor(IDBKeyRange.lowerBound(
      new Date(until * 1000).toISOString()
    ));

    return this.loadCursorEventsToNSet(cursor);
  }

  private async loadCursorEventsToNSet(cursor: IDBPCursorWithValue<IdbNostrEventCache, [any], any> | null, nset = new NSet()): Promise<NSet> {
    while (cursor) {
      if (cursor.value) {
        nset.add(cursor.value);
      }

      cursor = await cursor.continue();
    }

    return nset;
  }
}