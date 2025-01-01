import { NPub } from 'nostr-tools/nip19';
import { HexString } from '../event/primitive/hex-string.type';

/**
 * Account composed only of information derived from pubkey calculations.
 */
export interface AccountNotLoaded {
  pubkey: HexString;
  npub: NPub;
  state: 'notloaded'
}
