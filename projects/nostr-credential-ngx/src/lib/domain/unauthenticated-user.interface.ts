import { TNcryptsec, TNostrPublic, TNip05 } from "@belomonte/nostr-ngx";

export interface IUnauthenticatedUser {
  npub: TNostrPublic;
  ncryptsec: TNcryptsec;
  displayName: string;

  /**
   * TODO: mudar esta propriedade para armazenar a imagem em base64, de forma que a
   * imagem de perfil não dependa de internet ou estabilidade de relay para ser exibida
   */
  picture: string;
  nip05?: TNip05;
  nip05valid?: boolean;
}
