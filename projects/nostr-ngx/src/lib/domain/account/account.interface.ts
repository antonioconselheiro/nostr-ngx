
import { AccountComplete } from './account-complete.interface';
import { AccountEssential } from './account-essential.interface';
import { AccountPointable } from './account-pointable.interface';
import { AccountNotLoaded } from './account-not-loaded.interface';
import { AccountViewable } from './account-viewable.interface';
import { AccountAuthenticable } from './account-authenticable.interface';

export type Account = AccountNotLoaded | AccountEssential | AccountViewable | AccountPointable | AccountComplete | AccountAuthenticable;
