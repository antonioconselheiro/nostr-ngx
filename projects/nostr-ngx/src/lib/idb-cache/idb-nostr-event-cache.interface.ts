import { DBSchema } from 'idb';
import { NostrEvent } from 'nostr-tools';

export interface IdbNostrEventCache extends DBSchema {
  tagIndex: {
    key: number;
    value: {
      key: number;
      tag: string;
      value: string;
      eventId: string;
    };
    indexes: {
      tagAndValue: [ string, string ];
      tag: string;
      eventId: string;
    }
  };
  nostrEvents: {
    key: string;
    value: NostrEvent;
    indexes: {
      pubkey: string;
      kind: number;
      content: string;
      created_at: number;
    }
  };
}
