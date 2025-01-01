import { NostrMetadata } from '@nostrify/nostrify';
import { NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { HexString } from '../event/primitive/hex-string.type';
import { AccountNip05 } from './account-nip05.interface';

/**
 * Account with profile image, metadata and nip05 loaded.
 *
 * This state should be consolidated if the client interprets that the user may be intending
 * to open the account, previously loading the nip05 when, for example, observing a hover.
 */
export interface AccountFullLoaded {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'full';
  nip05: AccountNip05 | null;
  metadata: NostrMetadata | null;
  displayName: string;
  relays: NostrUserRelays;
}