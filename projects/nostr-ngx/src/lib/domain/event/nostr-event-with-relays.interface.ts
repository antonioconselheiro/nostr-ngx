
import { NostrEvent } from "./nostr-event.interface";
import { RelayDomainString } from "./relay-domain-string.type";
import { StrictTagKinds } from "./strict-tag-kinds.type";

export interface NostrEventWithRelays<T extends StrictTagKinds | number = number> {
  event: NostrEvent<T>;
  origin: Array<RelayDomainString>;
}
