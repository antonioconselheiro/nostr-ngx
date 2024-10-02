import { DBSchema } from 'idb';
import { AccountResultset } from './account-resultset.type';

export interface IdbProfileCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: AccountResultset;
    indexes: {
      pubkey: string;
    }
  };
}
