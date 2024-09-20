import { DBSchema } from 'idb';
import { NostrEvent } from 'nostr-tools';

export interface IdbNostrEventCache extends DBSchema {
  nostrEvents: {
    key: string;
    value: NostrEvent;
  };
}
