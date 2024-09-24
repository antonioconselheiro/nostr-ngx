import { RelayRecord } from "nostr-tools/relay";

export interface NostrConfig {
  defaultProfile: {
    picture: string;
    banner: string;
  };
  defaultFallback: RelayRecord;
}
