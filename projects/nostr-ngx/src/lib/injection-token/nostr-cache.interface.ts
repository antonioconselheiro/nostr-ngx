import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrFilter } from '../pool/nostr-filter.interface';

/**
 * Cache structure where both cached events and prefetched account data can be accessed.
 * This should help find already loaded profiles and events.
 * The provided implementation will be used by NostrPool.
 */
export interface NostrCache {

  /**
   * get an event from cache if it exists
   */
  get(idEvent: HexString): NostrEventWithRelays | null;

  /**
   * query cache async
   */
  query(filters: NostrFilter[]): Promise<NostrEventWithRelays[]>;
  
  /**
   * save event in cache
   */
  cache(event: NostrEventWithRelays): Promise<void>;

  /**
   * remove event from cache
   */
  remove(filters: NostrFilter[]): Promise<void>;
}
