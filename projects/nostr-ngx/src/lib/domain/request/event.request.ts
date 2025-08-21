import { NostrEvent } from "../event/nostr-event.interface";

/** Used to publish events.. */
export type EventRequest = ['EVENT', NostrEvent];