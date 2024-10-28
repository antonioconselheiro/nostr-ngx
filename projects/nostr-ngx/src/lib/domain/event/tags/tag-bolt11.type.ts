/**
 * Lightning Network Bolt URL tag
 * Used to reference a bolt11.
 * 
 * Format:
 * ['bolt11', <bolt11 address>]
 * 
 * References:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/57.md#appendix-e-zap-receipt-event
 * https://github.com/lightning/bolts/blob/master/11-payment-encoding.md
 */
export type TagBolt11 = ['bolt11', `lnbc1${string}` | `lntb1${string}` | `lntbs1${string}` | `lnbcrt1${string}`];
