
import { NostrEvent } from "./nostr-event.interface";
import { RelayDomain } from "./relay-domain.interface";
import { StrictTagKinds } from "./strict-tag-kinds.type";

export interface NostrEventOrigins<T extends StrictTagKinds | number = number> {
  event: NostrEvent<T>;
  origin: Array<RelayDomain>;
}
