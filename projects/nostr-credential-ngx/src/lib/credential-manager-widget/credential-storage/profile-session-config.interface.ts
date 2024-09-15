import { NostrSessionConfig } from '@belomonte/nostr-ngx';
import { NostrMetadata } from '@nostrify/nostrify';

export interface ProfileSessionConfig extends NostrSessionConfig {
  metadata?: NostrMetadata;
}
