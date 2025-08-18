import { RelayDomainString } from "../relay-domain-string.type";

/**
 * Relay List
 * This tag represent a list of relays.
 * 
 * Format:
 * tag in format ['relays', 'wss://relay.example', 'wss://other.relays' ]
 * 
 * References:
 * https://github.com/nostr-protocol/nips/blob/dde8c81a87f01131ed2eec0dd653cd5b79900b82/57.md
 */
export type TagRelayList = ['relays', ...Array<RelayDomainString>];
