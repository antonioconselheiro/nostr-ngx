import { NostrMetadata } from '@nostrify/nostrify';
import { DBSchema } from 'idb';
import { ProfilePointer } from 'nostr-tools/nip19';

export interface IdbProfileCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: {
      pubkey: string;
      metadata: NostrMetadata;
      nip5?: ProfilePointer | null;
    };
    indexes: {
      pubkey: string;
    }
  };
}
