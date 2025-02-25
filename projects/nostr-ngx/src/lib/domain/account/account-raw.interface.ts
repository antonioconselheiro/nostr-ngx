import { HexString } from "../event/primitive/hex-string.type";

/**
 * Raw account with no data but pubkey, neither calculated npub;
 * lazy load version to avoid processing data when it is not necessary
 */
export interface AccountRaw {
  pubkey: HexString;
  state: 'raw';
}
