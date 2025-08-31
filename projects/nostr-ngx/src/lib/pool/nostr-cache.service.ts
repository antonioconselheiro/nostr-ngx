import { LRUCache } from 'lru-cache';
import { matchFilters } from 'nostr-tools';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrEventCollection } from '../cache/nostr-event.collection';
import { NostrFilter } from './nostr-filter.interface';
import { NostrCache } from './nostr-cache.interface';

export class NostrCacheService extends NostrEventCollection implements NostrCache {
  constructor(...args: ConstructorParameters<typeof LRUCache<string, NostrEventWithRelays>>) {
    super(new LRUCache<string, NostrEventWithRelays>(...args));
  }

  async cache(origins: NostrEventWithRelays): Promise<void> {
    this.add(origins);
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
    for (const origins of this) {
      if (matchFilters(filters, origins.event)) {
        this.delete(origins.event.id);
      }
    }
  }
}

