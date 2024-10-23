import { NProfile, NPub } from "nostr-tools/nip19";

export interface NostrPublicUser {
  pubkey: string;
  npub: NPub;
  nprofile?: NProfile;
}