
import { NostrLocalConfig } from '../configs/nostr-local-config.interface';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';

export interface AccountsLocalConfig extends NostrLocalConfig {
  accounts?: {
    [pubkey: string]: IUnauthenticatedAccount
  };
}
