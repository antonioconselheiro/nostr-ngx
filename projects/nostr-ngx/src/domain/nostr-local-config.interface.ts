import { TNostrPublic } from "./nostr-public.type";
import { TRelayMap } from "./relay-map.type";

export interface INostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';
  commonRelays?: TRelayMap;
  userRelays?: {
    [npub: TNostrPublic]: TRelayMap;
  }
}
