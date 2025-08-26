import { PoolRequestOptions } from "../../pool/pool-request.options";
import { NostrEventWithRelays } from "../event/nostr-event-with-relays.interface";
import { NostrFilter } from "./nostr-filter.type";

/** Nostr event store. */
export interface NostrStore {
  /** Get an array of events matching filters. */
  query(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<NostrEventWithRelays[]>;

  //  FIXME: revisar as implementações do remove para garantir que não fiquem issueds
  /** Remove events from the store. This action is temporary, unless a kind `5` deletion is issued. */
  remove?(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<void>;
}
