import { LRUCache } from 'lru-cache';
import { matchFilters } from 'nostr-tools';
import { NostrEventWithRelays } from '../event/nostr-event-with-relays.interface';
import { NostrEvent } from '../event/nostr-event.interface';
import { NostrFilter } from './nostr-filter.type';
import { NostrSet } from './nostr-set.type';
import { NostrStore } from './nostr-store.type';

export class NostrCache extends NostrSet implements NostrStore {
  constructor(...args: ConstructorParameters<typeof LRUCache<string, NostrEventWithRelays>>) {
    super(new LRUCache<string, NostrEventWithRelays>(...args));
  }

  async event(event: NostrEvent): Promise<void> {
    this.add({ event });
  }

  async query(filters: NostrFilter[]): Promise<NostrEventWithRelays[]> {
    const resultsets: NostrEventWithRelays[] = [];

    for (const origins of this) {
      if (matchFilters(filters, origins.event)) {
        this.cache.get(origins.event.id);
        resultsets.push(origins);
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

