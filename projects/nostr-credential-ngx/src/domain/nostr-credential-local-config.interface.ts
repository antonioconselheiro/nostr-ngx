import { INostrLocalConfig } from '@belomonte/nostr-ngx';
import { IUnauthenticatedUser } from './unauthenticated-user';

export interface INostrCredentialLocalConfig extends INostrLocalConfig {
  accounts?: Record<string, IUnauthenticatedUser>;
}