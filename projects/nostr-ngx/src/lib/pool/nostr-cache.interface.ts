import { NostrEventWithRelays } from "../domain/event/nostr-event-with-relays.interface"
import { NostrFilter } from "./nostr-filter.interface"

export interface NostrCache {
  cache(origins: NostrEventWithRelays): Promise<void>
  query(filters: NostrFilter[]): Promise<NostrEventWithRelays[]>
  remove(filters: NostrFilter[]): Promise<void>
}