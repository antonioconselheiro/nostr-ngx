import { LRUCache } from 'lru-cache';
import { matchFilters } from 'nostr-tools';
import { NostrEventWithRelays } from '../event/nostr-event-with-relays.interface';
import { NostrFilter } from './nostr-filter.type';
import { NostrSet } from './nostr-set.type';
import { NostrStore } from './nostr-store.type';

export class NostrCacheService extends NostrSet implements NostrStore {
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

