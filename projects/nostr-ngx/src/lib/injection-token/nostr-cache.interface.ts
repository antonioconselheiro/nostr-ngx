import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { NStore } from '../domain/nostrify/nstore.type';
import { NostrProfileCache } from './nostr-profile-cache.interface';

/**
 * Cache structure where both cached events and prefetched account data can be accessed.
 * This should help find already loaded profiles and events.
 * The provided implementation will be used by NostrPool.
 */
export interface NostrCache extends NStore {

  /**
   * service focused in cache prefetched user data, the Account object
   */
  profiles: NostrProfileCache;

  /**
   * get an event from cache if it exists
   */
  get(idEvent: HexString): NostrEvent | null;

  /**
   * query cache sync
   */
  syncQuery(filters: NostrFilter[]): NostrEvent[];

  /**
   * query cache async
   */
  query(filters: NostrFilter[]): Promise<NostrEvent[]>;
  
  /**
   * save event in cache
   */
  event(event: NostrEvent): Promise<void>;

  /**
   * remove event from cache
   */
  remove(filters: NostrFilter[]): Promise<void>;
}
