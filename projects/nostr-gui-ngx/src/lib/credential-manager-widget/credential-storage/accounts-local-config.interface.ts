import { NostrLocalConfig } from '@belomonte/nostr-ngx';
import { IUnauthenticatedAccount } from '../../domain/unauthenticated-account.interface';

export interface AccountsLocalConfig extends NostrLocalConfig {
  accounts?: {
    [npub: string]: IUnauthenticatedAccount
  };
}
