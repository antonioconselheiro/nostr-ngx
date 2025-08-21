import { NostrEvent } from "../event/nostr-event.interface";

/** NIP-42 `AUTH`, used to authenticate the client to the relay. */
export type AuthRequest = ['AUTH', NostrEvent];
