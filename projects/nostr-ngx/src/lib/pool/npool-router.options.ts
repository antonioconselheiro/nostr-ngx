import { NostrEvent } from '../domain/event/nostr-event.interface';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { NRelay } from '../domain/nostrify/nrelay';
import { NPoolRequestOptions } from './npool-request.options';

export interface NpoolRouterOptions {

  /** Creates an `NRelay` instance for the given URL. */
  open(url: WebSocket['url']): NRelay;

  /** Determines the relays to use for making `REQ`s to the given filters. To support the Outbox model, it should analyze the `authors` field of the filters. */
  reqRouter(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<ReadonlyMap<WebSocket['url'], NostrFilter[]>>;

  /** Determines the relays to use for publishing the given event. To support the Outbox model, it should analyze the `pubkey` field of the event. */
  eventRouter(event: NostrEvent, opts?: NPoolRequestOptions): Promise<WebSocket['url'][]>;

}