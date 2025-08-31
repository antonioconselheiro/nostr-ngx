import { Ncryptsec, NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { AccountNip05Detail } from './account-nip05-detail.type';
import { HexString } from '../event/primitive/hex-string.type';
import { Base64String } from '../base64-string.type';
import { NostrMetadata } from './nostr-metadata.type';

/**
 * Authenticable account, have all account data loaded and a ncryptsec to user authenticate.
 */
export interface AccountAuthenticable {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'authenticable';
  nip05: AccountNip05Detail | null;  
  ncryptsec: Ncryptsec;
  metadata: NostrMetadata | null;
  displayName: string;

  /**
   * Picture is a base64 string or null
   */
  pictureBase64: Base64String | null;

  /**
   * Picture is an url string or null
   */
  pictureUrl: string | null;
  relays: NostrUserRelays;
}
