
import { NostrEvent } from "../domain/event/nostr-event.interface";
import { RelayDomain } from "../domain/event/relay-domain.interface";

export interface NostrEventResultset {
  event: NostrEvent;
  origin: Array<RelayDomain>;
}