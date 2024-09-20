import { NostrLocalConfigAccount } from "../configs/nostr-local-config-account.interface";
import { NostrLocalConfigRelays } from "../configs/nostr-local-config-relays.interface";
import { Ncryptsec } from "./ncryptsec.type";
import { Nip05 } from "./nip05.type";


export interface IUnauthenticatedAccount extends NostrLocalConfigAccount {
  pubkey: string;
  ncryptsec: Ncryptsec;
  displayName: string;

  /**
   * TODO: mudar esta propriedade para armazenar a imagem em base64, de forma que a
   * imagem de perfil não dependa de internet ou estabilidade de relay para ser exibida
   */
  picture: string;
  nip05?: Nip05;
  relays: NostrLocalConfigRelays;
}
