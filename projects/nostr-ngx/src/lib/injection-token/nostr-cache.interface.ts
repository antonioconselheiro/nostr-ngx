import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { NostrStore } from '../domain/nostrify/nostr-store.type';
import { NostrEventWithOrigins } from '../domain/event/nostr-event-with-origins.interface';
import { NostrProfileCache } from './nostr-profile-cache.interface';

/**
 * Cache structure where both cached events and prefetched account data can be accessed.
 * This should help find already loaded profiles and events.
 * The provided implementation will be used by NostrPool.
 */
export interface NostrCache extends NostrStore {

  /**
   * service focused in cache prefetched user data, the Account object
   */
  profiles: NostrProfileCache;

  /**
   * get an event from cache if it exists
   */
  get(idEvent: HexString): NostrEventWithOrigins | null;

  /**
   * query cache sync
   */
  syncQuery(filters: NostrFilter[]): NostrEventWithOrigins[];

  /**
   * query cache async
   */
  query(filters: NostrFilter[]): Promise<NostrEventWithOrigins[]>;
  
  /**
   * save event in cache
   */
  event(event: NostrEventWithOrigins): Promise<void>;

  /**
   * remove event from cache
   */
  remove(filters: NostrFilter[]): Promise<void>;
}
