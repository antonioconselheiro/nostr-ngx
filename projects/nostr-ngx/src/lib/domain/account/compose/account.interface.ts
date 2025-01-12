import { AccountAuthenticable } from '../account-authenticable.interface';
import { AccountComplete } from '../account-complete.interface';
import { AccountEssential } from '../account-essential.interface';
import { AccountCalculated } from '../account-calculated.interface';
import { AccountPointable } from '../account-pointable.interface';
import { AccountViewable } from '../account-viewable.interface';
import { AccountState } from '../account-state.type';

/**
 * Represents any kind of account
 */
export type Account = (AccountCalculated | AccountEssential | AccountViewable | AccountPointable | AccountComplete | AccountAuthenticable | AccountAuthenticable) & { state: AccountState };
