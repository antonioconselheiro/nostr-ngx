import { DBSchema } from 'idb';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrEventOrigins } from '../domain/event/nostr-event-origins.interface';

export interface IdbNostrEventCache extends DBSchema {
  nostrEvents: {
    key: HexString;
    value: NostrEventOrigins;
  };
}
