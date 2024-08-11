import { INostrSessionConfig } from '@belomonte/nostr-ngx';
import { NostrMetadata } from '@nostrify/nostrify';

export interface IProfileSessionConfig extends INostrSessionConfig {
  metadata?: NostrMetadata;
}