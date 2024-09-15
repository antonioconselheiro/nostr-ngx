import { Ncryptsec } from '../domain/ncryptsec.type';
import { NSec } from '../domain/nsec.type';

/**
 * saved in session storage
 */
export interface NostrSessionConfig {
  sessionFrom: 'none' | 'sessionStorage' | 'signer' | 'bunker' | 'memory';
  ncryptsec?: Ncryptsec;
  nsec?: NSec;
}
