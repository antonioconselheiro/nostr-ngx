import { TNcryptsec } from './ncryptsec.type';
import { TNostrSecret } from './nostr-secret.type';

export interface INostrSessionConfig {
  sessionFrom: 'none' | 'sessionStorage' | 'signer' | 'memory';
  ncryptsec?: TNcryptsec;
  nsec?: TNostrSecret;
}