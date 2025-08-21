import { PoolRequestOptions } from "../../pool/pool-request.options";
import { NostrEventWithOrigins } from "../event/nostr-event-with-origins.interface";
import { NostrEvent } from "../event/nostr-event.interface";
import { NostrFilter } from "./nostr-filter.type";

/** Nostr event store. */
export interface NostrStore {
  /** Add an event to the store (equivalent of `EVENT` verb). */
  event(event: NostrEvent, opts?: PoolRequestOptions): Promise<void>;
  /** Get an array of events matching filters. */
  query(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<NostrEventWithOrigins[]>;
  /** Remove events from the store. This action is temporary, unless a kind `5` deletion is issued. */
  remove?(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<void>;
}
