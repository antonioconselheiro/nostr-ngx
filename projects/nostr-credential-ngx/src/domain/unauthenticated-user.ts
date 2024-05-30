import { TNcryptsec, TNostrPublic, TNip05 } from "@belomonte/nostr-ngx";

export interface IUnauthenticatedUser {
  npub: TNostrPublic;
  ncryptsec: TNcryptsec;
  displayName: string;
  picture: string;
  nip05?: TNip05;
}
