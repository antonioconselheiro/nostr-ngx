import { TRelayMap } from "./relay-map.type";

export interface INostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';
  commonRelays?: TRelayMap;

  /**
   * string index is npub
   */
  userRelays?: Record<string, TRelayMap>;
}
