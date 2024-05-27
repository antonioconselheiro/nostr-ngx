import { INostrSessionConfig } from '@belomonte/nostr-ngx';
import { IProfile } from './profile.interface';

export interface INostrCredentialSessionConfig extends INostrSessionConfig {
  profile?: IProfile;
}