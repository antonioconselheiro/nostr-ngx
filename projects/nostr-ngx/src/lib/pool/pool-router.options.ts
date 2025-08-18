import { NostrEvent } from 'nostr-tools';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { PoolRequestOptions } from './pool-request.options';

export interface PoolRouterOptions {

  /**
   * Determines the relays to use for making `REQ`s to the given filters.
   */
  reqRouter(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<ReadonlyMap<RelayDomainString, NostrFilter[]>>;

  /**
   * Determines the relays to use for publishing the given event.
   */
  eventRouter(event: NostrEvent, opts?: PoolRequestOptions): Promise<RelayDomainString[]>;

}