import { DBSchema } from 'idb';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrEventWithOrigins } from '../domain/event/nostr-event-with-origins.interface';

export interface IdbNostrEventCache extends DBSchema {
  nostrEvents: {
    key: HexString;
    value: NostrEventWithOrigins;
  };
}
