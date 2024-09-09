import { NostrEvent } from '@nostrify/nostrify';
import { ProfilePointer } from 'nostr-tools/nip19';
import { Nprofile } from '../domain/nostr-profile.type';

export interface NPoolRequestOptions {
  /**
   * A AbortSignal allow you to emit an 'abort' event and stop request / publication when unsubscribe
   */
  signal?: AbortSignal;

  /**
   * Relays to be included in the operation
   */
  include?: Array<WebSocket['url'] | NostrEvent | ProfilePointer | Nprofile>;

  /**
   * Limit operation to these relays
   */
  useOnly?: Array<WebSocket['url'] | NostrEvent | ProfilePointer | Nprofile>;
}