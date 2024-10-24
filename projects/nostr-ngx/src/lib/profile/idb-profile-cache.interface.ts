import { DBSchema } from 'idb';
import { AccountResultset } from './account-resultset.type';
import { HexString } from '../domain/hex-string.interface';

export interface IdbProfileCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: AccountResultset;
    indexes: {
      pubkey: HexString;
    }
  };
}
