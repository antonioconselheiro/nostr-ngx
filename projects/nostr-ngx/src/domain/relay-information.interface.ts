/**
 * NIP-11 missing properties
 * https://github.com/nbd-wtf/nostr-tools/issues/415
 */
export interface RelayInformationTemp {
  limitation: {
    max_subscriptions?: number;
    created_at_lower_limit?: number;
    created_at_upper_limit?: number;
    restricted_writes?: boolean;
  }
}