import { NProfile } from "./nprofile.type";
import { NPub } from "./npub.type";

export interface NostrPublicUser {
  pubkey: string;
  npub: NPub;
  nprofile?: NProfile;
}