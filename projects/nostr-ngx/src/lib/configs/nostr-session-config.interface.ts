import { NSec } from '../domain/nsec.type';

/**
 * saved in session storage
 */
export interface NostrSessionConfig {
  nsec?: NSec;
}
