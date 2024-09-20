
import { NostrMetadata } from '@nostrify/nostrify';
import { NPub } from './npub.type';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';

export interface IAuthenticatedAccount {
  metadata: NostrMetadata | null;
  npub: NPub;
  pubkey: string;
  relays: NostrUserRelays;
}
