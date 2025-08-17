import { LRUCache } from 'lru-cache';
import { matchFilters } from 'nostr-tools';
import { NostrEventOrigins } from '../event/nostr-event-origins.interface';
import { NostrFilter } from './nostr-filter.type';
import { NostrRelayCOUNT } from './nostr-relay-message.type';
import { NostrSet } from './nostr-set.type';
import { NostrStore } from './nostr-store.type';

/**
 * Nostr LRU cache based on [`npm:lru-cache`](https://www.npmjs.com/package/lru-cache).
 * It implements both `NStore` and `NSet` interfaces.
 *
 * ```ts
 * // Accepts the options of `npm:lru-cache`:
 * const cache = new NCache({ max: 1000 });
 *
 * // Events can be added like a regular `Set`:
 * cache.add(event1);
 * cache.add(event2);
 *
 * // Can be queried like `NStore`:
 * const events = await cache.query([{ kinds: [1] }]);
 *
 * // Can be iterated like `NSet`:
 * for (const event of cache) {
 *  console.log(event);
 * }
 * ```
 */
export class NCache extends NostrSet implements NostrStore {
  constructor(...args: ConstructorParameters<typeof LRUCache<string, NostrEventOrigins>>) {
    //  FIXME: preciso dar um jeito de harmonizar esta tipagem corretamente
    super(new LRUCache<string, NostrEventOrigins>(...args) as any as Map<string, NostrEventOrigins>);
  }

  async event(event: NostrEventOrigins): Promise<void> {
    this.add(event);
  }

  async query(filters: NostrFilter[]): Promise<NostrEventOrigins[]> {
    const resultsets: NostrEventOrigins[] = [];

    for (const resultset of this) {
      if (matchFilters(filters, resultset.event)) {
        this.cache.get(resultset.event.id);
        resultsets.push(resultset);
      }
    }

    return resultsets;
  }

  async remove(filters: NostrFilter[]): Promise<void> {
    for (const resultset of this) {
      if (matchFilters(filters, resultset.event)) {
        this.delete(resultset);
      }
    }
  }

  async count(filters: NostrFilter[]): Promise<NostrRelayCOUNT[2]> {
    const events = await this.query(filters);
    return {
      count: events.length,
      approximate: false,
    };
  }
}

