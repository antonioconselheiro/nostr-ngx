
import { AccountDeepLoaded } from './account-deep-loaded.interface';
import { AccountEssentialLoaded } from './account-essential-loaded.interface';
import { AccountFullLoaded } from './account-full-loaded.interface';
import { AccountNotLoaded } from './account-not-loaded.interface';
import { AccountViewingLoaded } from './account-viewing-loaded.interface';
import { UnauthenticatedAccount } from './unauthenticated-account.interface';

export type Account = AccountNotLoaded | AccountEssentialLoaded | AccountViewingLoaded | AccountFullLoaded | AccountDeepLoaded | UnauthenticatedAccount;
