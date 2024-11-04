/**
 * Lightning Network URL tag
 * Used to reference a lnurl
 * 
 * Format:
 * ['lnurl', <lnurl address>]
 * 
 * References:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/57.md
 */
export type TagLnurl = ['lnurl', `lnurl1${string}`];