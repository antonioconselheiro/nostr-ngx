import { LRUCache } from 'lru-cache';
import { matchFilters } from 'nostr-tools';
import { NostrEventWithOrigins } from '../event/nostr-event-with-origins.interface';
import { NostrEvent } from '../event/nostr-event.interface';
import { NostrFilter } from './nostr-filter.type';
import { NostrSet } from './nostr-set.type';
import { NostrStore } from './nostr-store.type';

export class NostrCache extends NostrSet implements NostrStore {
  constructor(...args: ConstructorParameters<typeof LRUCache<string, NostrEventWithOrigins>>) {
    super(new LRUCache<string, NostrEventWithOrigins>(...args));
  }

  async event(event: NostrEvent): Promise<void> {
    this.add({ event });
  }

  async query(filters: NostrFilter[]): Promise<NostrEventWithOrigins[]> {
    const resultsets: NostrEventWithOrigins[] = [];

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

