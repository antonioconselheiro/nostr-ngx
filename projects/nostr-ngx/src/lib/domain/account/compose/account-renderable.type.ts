import { AccountAuthenticable } from '../account-authenticable.interface';
import { AccountEssential } from '../account-essential.interface';
import { AccountPointable } from '../account-pointable.interface';
import { AccountComplete } from '../account-complete.interface';

/**
 * AccountRenderable is the name given for the union type of AccountEssential, AccountPointable,
 * AccountComplete or AccountAuthenticable.
 */
export type AccountRenderable = AccountEssential | AccountPointable | AccountComplete | AccountAuthenticable;
