import { Injectable } from '@angular/core';
import { NostrEvent, NostrFilter, NSet } from '@nostrify/nostrify';
import { IDBPDatabase, IDBPTransaction } from 'idb';
import { INostrCache } from './nostr-cache.interface';

@Injectable()
export class NostrCacheFilter {

  static indexableTag = [ 'p', 'e', 't' ];

  async query(db: IDBPDatabase<INostrCache>, filters: NostrFilter[]): Promise<NostrEvent[]> {
    const set = new NSet();
    const txEvent = this.db.transaction('nostrEvents', 'readonly');
    const txTag = this.db.transaction('tagIndex', 'readonly');

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

  private *querySingleFilter(
    filter: NostrFilter,
    txEvent: IDBPTransaction<INostrCache, ["nostrEvents"], "readonly">,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): AsyncIterable<NostrEvent> {

    if (filter.ids?.length) {

    }

    if (filter.kinds) {

    }

    for await () {
      yield null;
    }
  }

  private loadEventFromTags(
    filter: NostrFilter,
    txTag: IDBPTransaction<INostrCache, ["tagIndex"], "readonly">
  ): Promise<Array<string>> {
    const allFoundsIds: Array<Set<string>> = [];
    const tagFilterMatcher = /^#/;
    const tagSearch = Object
      .keys(filter)
      .filter(key => tagFilterMatcher.test(key))
      .map(key => key.replace(tagFilterMatcher, ''))
      .filter(tag => NostrCacheFilter.indexableTag.includes(tag));

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

    return Promise.resolve([...intersection]);
  }

  private loadEventSearchTerm(): Promise<Map<string, NostrEvent>> {
    return Promise.resolve(new Map());
  }

  private loadEventFromAuthor(): Promise<Map<string, NostrEvent>> {
    return Promise.resolve(new Map());
  }

  private loadEventFromKinds(): Promise<Map<string, NostrEvent>> {
    return Promise.resolve(new Map());
  }
}