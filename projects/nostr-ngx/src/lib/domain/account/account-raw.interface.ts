import { HexString } from "../event/primitive/hex-string.type";

/**
 * Raw account with no data but pubkey, neither calculated npub;
 * lazy load version to avoid processing data when it is not necessary
 */
export interface AccountRaw {
  pubkey: HexString;
  npub: null;
  state: 'raw';
  nip05: null;
  displayName: null;
  
  /**
   * Picture is a base64 string or null
   */
  pictureBase64: null;
  
  /**
   * Picture is an url string or null
   */
  pictureUrl: null;
}
