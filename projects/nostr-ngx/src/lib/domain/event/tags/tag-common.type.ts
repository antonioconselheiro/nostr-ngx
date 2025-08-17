import { HexString } from "../primitive/hex-string.type";
import { RelayDomain } from "../relay-domain.interface";

/**
 * Tags supported in all events
 *
 * References:
 * Expiration tag:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/40.md
 * 
 * Nonce tag, for Proof of Word
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/13.md
 * 
 * Zap tag for calculate pay request instead use author pubkey:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/57.md#appendix-g-zap-tag-on-other-events
 */
export type TagCommon = ['expiration', `${number}`] |
  ['k', `${number}`] |
  ['t', string] |
  ['d', string] |
  ['a', `${number}:${HexString}:${string}`] |
  ['a', `${number}:${HexString}:${string}`, RelayDomain] |
  ['nonce', `${number}`, `${number}`] |
  ['zap', HexString, RelayDomain, `${number}` ];
