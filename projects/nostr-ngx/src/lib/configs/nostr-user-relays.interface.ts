import { RelayRecord } from "nostr-tools/relay";

export interface NostrUserRelays {
  general: RelayRecord;
  directMessage?: Array<WebSocket['url']>;
  search?: Array<WebSocket['url']>;
  blocked?: Array<WebSocket['url']>;
}
