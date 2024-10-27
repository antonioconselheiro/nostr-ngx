
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Ncryptsec, NProfile, NPub } from 'nostr-tools/nip19';
import { HexString } from './event/hex-string.type';

export interface Account {
  pubkey: HexString;
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
