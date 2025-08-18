import { NostrEvent } from "../event/nostr-event.interface";

/** Used to send events requested by clients. */
export type EventResultset = ['EVENT', subscriptionId: string, NostrEvent];
