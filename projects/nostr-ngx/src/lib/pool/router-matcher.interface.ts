import { NostrEvent } from '../domain/event/nostr-event.interface';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';
import { EventRouterMatcher } from './event-router-matcher.interface';
import { RelayRecord } from 'nostr-tools/relay';

/**
 * The provided implementation of this interface will identify which relay must be used in each situation.
 * A RouterMatcher implementation must never use npool to load configs, this would cause a circular dependency.
 * 
 * Why you need that? https://mikedilger.com/gossip-model/
 */
export interface RouterMatcher {

  /**
   * found relays to publish an event
   */
  eventRouter: Array<EventRouterMatcher<NostrEvent>>;

  /**
   * list of relays when no relay was found
   */
  defaultFallback: () => RelayRecord;

  /**
   * List of relays to find users relay list
   */
  defaultSearch: () => Array<RelayDomainString>;

  /**
   * relays to request
   */
  requestRouter: () => Promise<Array<RelayDomainString>>;
}
