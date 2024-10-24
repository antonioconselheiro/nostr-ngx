import { NProfile, NPub } from 'nostr-tools/nip19';
import { HexString } from './hex-string.interface';

export interface NostrPublicUser {
  pubkey: HexString;
  npub: NPub;
  nprofile?: NProfile;
}