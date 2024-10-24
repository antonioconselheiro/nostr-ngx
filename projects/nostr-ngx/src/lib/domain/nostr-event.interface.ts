import { verifiedSymbol } from 'nostr-tools'
import { HexString } from './hex-string.interface';

//  why this class exists?
//  https://github.com/nbd-wtf/nostr-tools/pull/448
//  https://github.com/soapbox-pub/nostrify/issues/5
/**
 * Nostr Event
 */
export interface NostrEvent<T extends number = number> {
  /** 32-bytes lowercase hex-encoded sha256 of the serialized event data. */
  id: HexString;
  /** 32-bytes lowercase hex-encoded public key of the event creator */
  pubkey: HexString;
  /** Unix timestamp in seconds. */
  created_at: number;
  /** Integer between 0 and 65535. */
  kind: T;
  /** Matrix of arbitrary strings. */
  tags: string[][];
  /** Arbitrary string. */
  content: string;
  /** 64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data, which is the same as the `id` field. */
  sig: HexString;

  [verifiedSymbol]?: boolean
}
