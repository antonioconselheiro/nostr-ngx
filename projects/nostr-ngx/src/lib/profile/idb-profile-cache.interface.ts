import { NostrMetadata } from '@nostrify/nostrify';
import { DBSchema } from 'idb';

export interface IdbProfileCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: {
      pubkey: string;
      metadata: NostrMetadata
    };
    indexes: {
      pubkey: string;
    }
  };
}
