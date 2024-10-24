import { DBSchema } from 'idb';
import { NostrEvent } from '../domain/nostr-event.interface';

export interface IdbNostrEventCache extends DBSchema {
  nostrEvents: {
    key: string;
    value: NostrEvent;
  };
}
