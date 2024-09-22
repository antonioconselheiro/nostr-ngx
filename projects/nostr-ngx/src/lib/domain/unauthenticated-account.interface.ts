import { Account } from "./account.interface";
import { Ncryptsec } from "./ncryptsec.type";

export interface UnauthenticatedAccount extends Account {
  ncryptsec: Ncryptsec;
}
