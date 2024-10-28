import { NProfile, NPub } from 'nostr-tools/nip19';
import { HexString } from './event/primitive/hex-string.type';

export interface NostrPublicUser {
  pubkey: HexString;
  npub: NPub;
  nprofile?: NProfile;
}