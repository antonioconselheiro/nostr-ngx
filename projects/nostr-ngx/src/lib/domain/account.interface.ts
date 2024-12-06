
import { NostrMetadata } from '@nostrify/nostrify';
import { Ncryptsec, NProfile, NPub } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountNip05 } from './account-nip05.interface';
import { HexString } from './event/primitive/hex-string.type';

export interface Account {
  pubkey: HexString;
  npub: NPub;
  nprofile: NProfile;
  nip05: AccountNip05 | null;
  ncryptsec?: Ncryptsec;
  metadata: NostrMetadata | null;
  displayName: string;

  /**
   * TODO: mudar esta propriedade para armazenar a imagem em base64, de forma que a
   * imagem de perfil não dependa de internet ou estabilidade de relay para ser exibida
   */
  picture?: string;
  relays: NostrUserRelays;
}
