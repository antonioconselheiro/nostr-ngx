import { DBSchema } from 'idb';
import { NPub } from '../domain/npub.type';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrEvent } from 'nostr-tools';

export interface INostrCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: NostrMetadata & { npub: NPub; pictureB64: string; };
    indexes: {
      npub: string;
      display_name: string;
      name: string;
    }
  },
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
