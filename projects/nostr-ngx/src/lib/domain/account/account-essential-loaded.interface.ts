import { NostrMetadata } from '@nostrify/nostrify';
import { NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { HexString } from '../event/primitive/hex-string.type';

/**
 * account with pubkey, metadata and settings events loaded
 */
export interface AccountEssentialLoaded {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'essential';
  metadata: NostrMetadata | null;
  displayName: string;
  relays: NostrUserRelays;
}