import { NProfile, ProfilePointer } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { RelayDomain } from '../domain/event/relay-domain.interface';

export interface NPoolRequestOptions {
  /**
   * A AbortSignal allow you to emit an 'abort' event and stop request / publication when unsubscribe
   */
  signal?: AbortSignal;

  /**
   * Relays to be included in the operation
   */
  include?: Array<RelayDomain | NostrEvent | ProfilePointer | NProfile | undefined | null>;

  /**
   * Limit operation to these relays
   */
  useOnly?: Array<RelayDomain | NostrEvent | ProfilePointer | NProfile>;

  /**
   * Force ignore current configured ncache and nstore and request exclusively from relay 
   */
  ignoreCache?: boolean;
}