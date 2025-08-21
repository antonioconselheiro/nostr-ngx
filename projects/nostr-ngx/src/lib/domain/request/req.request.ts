import { NostrFilter } from "../nostrify/nostr-filter.type";

/** Used to request events and subscribe to new updates. */
export type ReqRequest = ['REQ', subscriptionId: string, ...NostrFilter[]];