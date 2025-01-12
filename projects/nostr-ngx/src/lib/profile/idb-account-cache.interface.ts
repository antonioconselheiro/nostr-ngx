import { DBSchema } from 'idb';
import { AccountPersistentCacheable } from '../domain/account/compose/account-persistent-cacheable.type';
import { HexString } from '../domain/event/primitive/hex-string.type';

export interface IdbAccountCache extends DBSchema {
  accounts: {
    key: string,

    /**
     * Save in cache account with any information loaded, except AccountAuthenticable.
     * If ncryptsec is included in account that's means that the account data is surely
     * saved in another place, and as it was loaded to memory now, it will be loaded
     * again from this place (if user choose to save it).
     */
    value: AccountPersistentCacheable;
    indexes: {
      pubkey: HexString;
    }
  };
}
