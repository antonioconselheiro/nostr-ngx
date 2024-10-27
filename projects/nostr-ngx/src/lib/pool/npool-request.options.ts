import { NProfile, ProfilePointer } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';

export interface NPoolRequestOptions {
  /**
   * A AbortSignal allow you to emit an 'abort' event and stop request / publication when unsubscribe
   */
  signal?: AbortSignal;

  /**
   * Relays to be included in the operation
   */
  include?: Array<WebSocket['url'] | NostrEvent | ProfilePointer | NProfile | undefined | null>;

  /**
   * Limit operation to these relays
   */
  useOnly?: Array<WebSocket['url'] | NostrEvent | ProfilePointer | NProfile>;

  /**
   * Force ignore current configured ncache and nstore and request exclusively from relay 
   */
  ignoreCache?: boolean;
}