import { NostrFilter } from "../../pool/nostr-filter.interface";

/** Used to request events and subscribe to new updates. */
export type ReqRequest = ['REQ', subscriptionId: string, ...NostrFilter[]];