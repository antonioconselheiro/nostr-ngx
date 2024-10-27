import { DBSchema } from 'idb';
import { AccountResultset } from './account-resultset.type';
import { HexString } from '../domain/event/hex-string.type';

export interface IdbProfileCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: AccountResultset;
    indexes: {
      pubkey: HexString;
    }
  };
}
