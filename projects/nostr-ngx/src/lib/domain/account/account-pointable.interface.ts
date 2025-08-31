import { NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { HexString } from '../event/primitive/hex-string.type';
import { NostrMetadata } from './nostr-metadata.type';
import { AccountNip05Detail } from './account-nip05-detail.type';

/**
 * Account with profile image, metadata and nip05 loaded.
 *
 * This state should be consolidated if the client interprets that the user may be intending
 * to open the account, previously loading the nip05 when, for example, observing a hover.
 */
export interface AccountPointable {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'pointable';
  nip05: AccountNip05Detail | null;
  metadata: NostrMetadata | null;
  displayName: string;
  relays: NostrUserRelays;

  /**
   * Picture is a base64 string or null
   */
  pictureBase64: null;

  /**
   * Picture is an url string or null
   */
  pictureUrl: string | null;
  
}