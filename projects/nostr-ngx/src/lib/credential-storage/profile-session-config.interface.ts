
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrSessionConfig } from '../configs/nostr-session-config.interface';

export interface ProfileSessionConfig extends NostrSessionConfig {
  metadata?: NostrMetadata;
}
