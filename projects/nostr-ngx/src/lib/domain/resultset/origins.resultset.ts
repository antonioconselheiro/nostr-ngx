import { NostrEventWithOrigins } from "../event/nostr-event-with-origins.interface";

/** Events with relay url included. */
export type OriginsResultset = ['ORIGINS', subscriptionId: string, NostrEventWithOrigins];
