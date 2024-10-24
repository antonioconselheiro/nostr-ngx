import { DBSchema } from 'idb';
import { NostrEvent } from '../domain/nostr-event.interface';
import { HexString } from '../domain/hex-string.interface';

export interface IdbNostrEventCache extends DBSchema {
  nostrEvents: {
    key: HexString;
    value: NostrEvent;
  };
}
