import { INostrLocalConfig } from '@belomonte/nostr-ngx';
import { IUnauthenticatedAccount } from '../../domain/unauthenticated-account.interface';

export interface IAccountsLocalConfig extends INostrLocalConfig {
  accounts?: {
    [npub: string]: IUnauthenticatedAccount
  };
}
