import { NostrMetadata } from '@nostrify/nostrify';
import { NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { HexString } from '../event/primitive/hex-string.type';
import { AccountNip05Detail } from './account-nip05-detail.type';

/**
 * Account with profile picture and metadata loaded, with this data detail the account can be displayed on screen.
 * If you want an interface that represents all renderable account (viewable, complete and authenticable) you must
 * use the interface AccountRenderable. 
 */
export interface AccountViewable {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'viewable';
  metadata: NostrMetadata | null;
  nip05: AccountNip05Detail | null;
  displayName: string;
  picture: string | null;
  relays: NostrUserRelays;
}
