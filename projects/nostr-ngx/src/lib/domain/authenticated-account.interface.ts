
import { NostrMetadata } from '@nostrify/nostrify';
import { NPub } from './npub.type';
import { NostrLocalConfigRelays } from '../configs/nostr-local-config-relays.interface';

export interface IAuthenticatedAccount {
  metadata: NostrMetadata | null;
  npub: NPub;
  pubkey: string;
  relays: NostrLocalConfigRelays;
}
