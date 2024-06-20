import { INostrSessionConfig } from '@belomonte/nostr-ngx';
import { IProfile } from '../../domain/profile.interface';

export interface IProfileSessionConfig extends INostrSessionConfig {
  profile?: IProfile;
}