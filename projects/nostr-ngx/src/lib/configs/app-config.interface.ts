import { RelayRecord } from "nostr-tools/relay";

export interface AppConfig {
  defaultProfile: {
    picture: string;
    banner: string;
  };
  defaultFallback: RelayRecord;
}
