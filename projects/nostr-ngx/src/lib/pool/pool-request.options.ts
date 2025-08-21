import { NProfile, ProfilePointer } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';

export interface PoolRequestOptions {

  /**
   * Abort signal
   */
  signal?: AbortSignal;

  /**
   * Relays to be included in the operation
   */
  include?: Array<RelayDomainString | NostrEvent | ProfilePointer | NProfile | undefined | null>;

  /**
   * Limit operation to these relays
   */
  useOnly?: Array<RelayDomainString | NostrEvent | ProfilePointer | NProfile>;

  /**
   * Force ignore current configured ncache and nstore and request exclusively from relay 
   */
  ignoreCache?: boolean;
}