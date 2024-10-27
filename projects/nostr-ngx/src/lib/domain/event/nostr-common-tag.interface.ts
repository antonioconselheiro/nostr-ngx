/**
 * Tags supported in all events
 *
 * Expiration tag:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/40.md
 * 
 * Nonce tag, for Proof of Word
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/13.md
 */
export type NostrCommonTag = ['expiration', `${number}`] | ['k', `${number}`] | ['t', string] | ['nonce', `${number}`, `${number}`];
