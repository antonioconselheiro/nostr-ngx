import { NostrMetadata } from '@nostrify/nostrify';
import { NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { AccountNip05Detail } from './account-nip05-detail.type';
import { HexString } from '../event/primitive/hex-string.type';

/**
 * When the account is fully loaded, including the profile banner image
 * and all other loadable data.
 * 
 * Account objects reach this level of detail when the profile is opened,
 * few instances of this type of account should be cached, since the banner
 * image adds a good amount of bytes to the cache, I believe that something
 * between 5 and 10 profiles is a reasonable measure for the profile cache
 * per access.
 * 
 * There are other user-controlled caches, such as the one for
 * unauthenticated accounts, in this cache there will be accounts
 * stored with more details, but it is a cache under user control.
 */
export interface AccountComplete {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'complete';
  nip05: AccountNip05Detail | null;
  metadata: NostrMetadata | null;
  displayName: string;
  picture: string | null;
  banner: string | null;
  relays: NostrUserRelays;
}