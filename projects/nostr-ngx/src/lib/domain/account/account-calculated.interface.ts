import { NPub } from 'nostr-tools/nip19';
import { HexString } from '../event/primitive/hex-string.type';

/**
 * Account composed only of information derived from pubkey calculations, with no data loaded;
 */
export interface AccountCalculated {
  pubkey: HexString;
  npub: NPub;
  state: 'calculated';
  nip05: null;
  picture: null;
  displayName: string;
}
