import { Ncryptsec, Nip05, NostrLocalConfigAccount, NostrLocalConfigRelays, NPub } from "@belomonte/nostr-ngx";

export interface IUnauthenticatedAccount extends NostrLocalConfigAccount {
  npub: NPub;
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
