import { RelayRecord } from "nostr-tools/relay";

export interface NostrLocalConfigRelays {
  general: RelayRecord;
  directMessage?: Array<WebSocket['url']>;
  search?: Array<WebSocket['url']>;
  blocked?: Array<WebSocket['url']>;
}
