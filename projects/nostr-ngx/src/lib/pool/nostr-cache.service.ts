import { LRUCache } from 'lru-cache';
import { matchFilters } from 'nostr-tools';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrEventCollection } from '../domain/event/nostr-event.collection';
import { NostrFilter } from './nostr-filter.interface';
import { NostrCache } from '../injection-token/nostr-cache.interface';

/**
 * Base structure for cache service that feeds on queries from the pool.
 * The service `InMemoryEventCache` extends this and implements as an angular service.
 */
export class NostrCacheService extends NostrEventCollection implements NostrCache {
  constructor(...args: ConstructorParameters<typeof LRUCache<string, NostrEventWithRelays>>) {
    super(new LRUCache<string, NostrEventWithRelays>(...args));
  }

  async cache(withRelays: NostrEventWithRelays): Promise<void> {
    this.add(withRelays);
  }

  async query(filters: NostrFilter[]): Promise<NostrEventWithRelays[]> {
    const resultsets: NostrEventWithRelays[] = [];

    for (const relays of this) {
      if (matchFilters(filters, relays.event)) {
        this.store.get(relays.event.id);
        resultsets.push(relays);
      }
    }

    return resultsets;
  }

  async remove(filters: NostrFilter[]): Promise<void> {
    for (const withRelays of this) {
      if (matchFilters(filters, withRelays.event)) {
        this.delete(withRelays.event.id);
      }
    }
  }
}

