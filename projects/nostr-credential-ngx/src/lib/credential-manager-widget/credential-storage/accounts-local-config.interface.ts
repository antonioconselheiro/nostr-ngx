import { INostrLocalConfig } from '@belomonte/nostr-ngx';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user.interface';

export interface IAccountsLocalConfig extends INostrLocalConfig {
  accounts?: Record<string, IUnauthenticatedUser>;
}
