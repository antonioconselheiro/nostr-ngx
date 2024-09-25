import { RelayRecord } from 'nostr-tools/relay';
import { NSec } from '../domain/nsec.type';

/**
 * saved in session storage
 */
export interface NostrSessionConfig {
  relays?: RelayRecord;
  nsec?: NSec;
}
