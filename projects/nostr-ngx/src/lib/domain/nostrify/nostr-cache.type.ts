import { NostrEventWithRelays } from "../event/nostr-event-with-relays.interface"
import { NostrFilter } from "./nostr-filter.type"
import { NostrStore } from "./nostr-store.type"

export interface NostrCache extends NostrStore {
  cache(origins: NostrEventWithRelays): Promise<void>
  query(filters: NostrFilter[]): Promise<NostrEventWithRelays[]>
  remove(filters: NostrFilter[]): Promise<void>
}