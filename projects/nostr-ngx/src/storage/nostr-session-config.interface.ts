import { TNcryptsec } from '../domain/ncryptsec.type';
import { TNostrSecret } from '../domain/nostr-secret.type';

export interface INostrSessionConfig {
  sessionFrom: 'none' | 'sessionStorage' | 'signer' | 'bunker' | 'memory';
  ncryptsec?: TNcryptsec;
  nsec?: TNostrSecret;
}
