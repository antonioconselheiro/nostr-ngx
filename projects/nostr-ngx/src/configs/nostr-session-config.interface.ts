import { Ncryptsec } from '../domain/ncryptsec.type';
import { Nsec } from '../domain/nostr-secret.type';

/**
 * saved in session storage
 */
export interface NostrSessionConfig {
  sessionFrom: 'none' | 'sessionStorage' | 'signer' | 'bunker' | 'memory';
  ncryptsec?: Ncryptsec;
  nsec?: Nsec;
}
