import { NostrMetadata } from '@nostrify/nostrify';
import { DBSchema } from 'idb';

export interface IdbProfileCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: NostrMetadata;
    indexes: {
      npub: string;
      display_name: string;
      name: string;
    }
  };
}
