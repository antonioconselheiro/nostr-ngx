import { DBSchema } from 'idb';
import { TNostrPublic } from '../domain/nostr-public.type';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrEvent } from 'nostr-tools';

export interface INostrCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: NostrMetadata & { npub: TNostrPublic; pictureB64: string; };
    indexes: {
      npub: 'npub',
      displayName: 'display_name',
      name: 'name'
    }
  },
  tagIndex: {
    key: string;
    value: {
      tag: string;
      value: string;
      eventId: string;
    };
    indexes: {
      tagAndValue: [ string, string ],
      tag: string
    }
  };
  nostrEvents: {
    key: string;
    value: NostrEvent;
    indexes: {
      pubkey: string,
      kind: string,
      content: string
    }
  };
}
