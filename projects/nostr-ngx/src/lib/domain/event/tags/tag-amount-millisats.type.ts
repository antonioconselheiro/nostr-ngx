/**
 * Amount tag presumidelly in millisats
 * A tag to indicate a amount of millisatoshis.
 * One satoshi are 1000 millisatoshis.
 * 
 * format ['amount', <stringified number>]
 * 
 * References:
 * Zap - https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/57.md
 */
export type TagAmountMillisats = ['amount', `${number}`];
