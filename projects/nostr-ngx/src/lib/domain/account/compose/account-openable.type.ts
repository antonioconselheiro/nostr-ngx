import { AccountAuthenticable } from '../account-authenticable.interface';
import { AccountComplete } from '../account-complete.interface';
import { AccountPointable } from '../account-pointable.interface';
import { AccountViewable } from '../account-viewable.interface';

/**
 * AccountOpenable is the name given for the union type of AccountPointable, AccountViewable,
 * AccountComplete or AccountAuthenticable. You can use it always you need any representation
 * with more data then AccountPointable.
 */
export type AccountOpenable = AccountPointable | AccountViewable | AccountComplete | AccountAuthenticable;