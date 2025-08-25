import { DBSchema } from 'idb';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';

export interface IdbNostrEventCache extends DBSchema {
  nostrEvents: {
    key: HexString;
    value: NostrEventWithRelays;
  };
}
