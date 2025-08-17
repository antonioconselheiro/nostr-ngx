import { NostrFilter } from "./nostr-filter.type";
import { NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from "./nostr-relay-message.type";
import { NostrStore } from "./nostr-store.type";

/** Nostr event store with support for relay subscriptions. */
export interface NRelay extends NostrStore {
  /** Subscribe to events matching the given filters. Returns an iterator of raw NIP-01 relay messages. */
  req(
    filters: NostrFilter[],
    opts?: { signal?: AbortSignal },
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED>;
}
