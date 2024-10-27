import { DBSchema } from 'idb';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/hex-string.type';

export interface IdbNostrEventCache extends DBSchema {
  nostrEvents: {
    key: HexString;
    value: NostrEvent;
  };
}
