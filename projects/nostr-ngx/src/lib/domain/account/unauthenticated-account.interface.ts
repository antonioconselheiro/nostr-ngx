import { NostrMetadata } from '@nostrify/nostrify';
import { Ncryptsec, NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { AccountNip05Pointer } from './account-nip05-pointer.type';
import { HexString } from '../event/primitive/hex-string.type';

/**
 * Authenticable account, have all account data loaded and a ncryptsec to user authenticate.
 */
export interface UnauthenticatedAccount {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'authenticable';
  nip05: AccountNip05Pointer | null;  
  ncryptsec: Ncryptsec;
  metadata: NostrMetadata | null;
  displayName: string;
  picture: string;
  banner: string;
  relays: NostrUserRelays;
}
