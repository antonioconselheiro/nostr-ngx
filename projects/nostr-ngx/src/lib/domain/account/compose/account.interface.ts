import { AccountAuthenticable } from '../account-authenticable.interface';
import { AccountCalculated } from '../account-calculated.interface';
import { AccountEssential } from '../account-essential.interface';
import { AccountPointable } from '../account-pointable.interface';
import { AccountState } from '../account-state.type';
import { AccountComplete } from '../account-complete.interface';

/**
 * Represents any kind of account
 */
export type Account = (AccountCalculated | AccountEssential | AccountComplete | AccountPointable | AccountAuthenticable) & { state: AccountState };
