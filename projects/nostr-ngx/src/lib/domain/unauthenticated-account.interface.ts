import { Ncryptsec } from 'nostr-tools/nip19';
import { Account } from "./account.interface";

export interface UnauthenticatedAccount extends Account {
  ncryptsec: Ncryptsec;
}
