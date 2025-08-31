import { NostrFilter } from "../../pool/nostr-filter.interface";

/** NIP-45 `COUNT`, used to request a count of all events matching the filters . */
export type CountRequest = ['COUNT', subscriptionId: string, ...NostrFilter[]];
