import { DBSchema } from 'idb';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';

export interface IdbNostrProfileCache extends DBSchema {
  nostrProfiles: {
    key: HexString;
    value: AccountRenderable;
  };
}
