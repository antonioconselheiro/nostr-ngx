
import { NostrMetadata } from '@nostrify/nostrify';
import { Ncryptsec } from './ncryptsec.type';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { NPub } from './npub.type';
import { NProfile } from './nprofile.type';

export interface Account {
  pubkey: string;
  npub: NPub;
  nprofile: NProfile;
  isNip05Valid: boolean;
  ncryptsec?: Ncryptsec;
  metadata: NostrMetadata | null;

  /**
   * TODO: mudar esta propriedade para armazenar a imagem em base64, de forma que a
   * imagem de perfil não dependa de internet ou estabilidade de relay para ser exibida
   */
  picture?: string;
  relays: NostrUserRelays;
}
