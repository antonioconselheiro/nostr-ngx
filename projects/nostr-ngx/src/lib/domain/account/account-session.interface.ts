import { AccountAuthenticable } from './account-authenticable.interface';
import { AccountComplete } from './account-complete.interface';

export type AccountSession = AccountComplete | AccountAuthenticable;
