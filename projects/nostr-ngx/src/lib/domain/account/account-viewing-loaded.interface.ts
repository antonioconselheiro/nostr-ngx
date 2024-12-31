import { NostrMetadata } from '@nostrify/nostrify';
import { NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../../configs/nostr-user-relays.interface';
import { HexString } from '../event/primitive/hex-string.type';

/**
 * Account with profile picture and metadata loaded, with this data detail the account can be displayed on screen.
 */
export interface AccountViewingLoaded {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  state: 'viewing';
  metadata: NostrMetadata | null;
  displayName: string;

  /**
   * TODO: armazenar a imagem em base64, de forma que a
   * imagem de perfil não dependa de internet ou estabilidade de relay para ser exibida
   */
  picture: string;
  relays: NostrUserRelays;
}
