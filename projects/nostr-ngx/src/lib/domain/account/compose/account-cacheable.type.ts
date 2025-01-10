import { AccountAuthenticable } from '../account-authenticable.interface';
import { AccountComplete } from '../account-complete.interface';
import { AccountEssential } from '../account-essential.interface';
import { AccountPointable } from '../account-pointable.interface';
import { AccountViewable } from '../account-viewable.interface';

/**
 * AccountCacheable is the name given for the union type of AccountEssential, AccountPointable,
 * AccountViewable or AccountComplete.
 */
export type AccountCacheable = AccountEssential | AccountPointable | AccountViewable | AccountComplete | AccountAuthenticable;
