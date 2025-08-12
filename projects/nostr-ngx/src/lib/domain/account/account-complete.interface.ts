import { NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { HexString } from '../event/primitive/hex-string.type';
import { AccountNip05Detail } from './account-nip05-detail.type';
import { Base64String } from '../base64-string.type';
import { NostrMetadata } from '../nostrify/nostr-metadata.type';

/**
 * Account with profile picture and metadata loaded, with this data detail the account can be displayed on screen.
 * If you want an interface that represents all renderable account (complete and authenticable) you must use the
 * interface AccountRenderable. 
 */
export interface AccountComplete {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'complete';
  metadata: NostrMetadata | null;
  nip05: AccountNip05Detail | null;
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
