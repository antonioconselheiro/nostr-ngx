import { NostrEventWithRelays } from "../event/nostr-event-with-relays.interface";

/** Events with relay url included. */
export type EventWithRelaysResultset = ['EVENT_WITH_RELAYS', subscriptionId: string, NostrEventWithRelays];
