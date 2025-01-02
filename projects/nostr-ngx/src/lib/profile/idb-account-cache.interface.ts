import { DBSchema } from 'idb';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { AccountViewable } from '../domain/account/account-viewable.interface';

export interface IdbAccountCache extends DBSchema {
  accounts: {
    key: string,
    value: AccountEssential | AccountPointable | AccountViewable | AccountComplete;
    indexes: {
      pubkey: HexString;
    }
  };
}
