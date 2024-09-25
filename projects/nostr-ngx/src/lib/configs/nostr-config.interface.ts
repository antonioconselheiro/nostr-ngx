import { RelayRecord } from "nostr-tools/relay";

export interface NostrConfig {
  defaultProfile: {
    picture: string;
    banner: string;
  };

  /**
   * relays fallback if user has no relay list or if there is no authenticated account,
   * user custom configs from localStorage will override this list 
   */
  defaultFallback: RelayRecord;
  bestFor?: {
    /**
     * override the default list of best relays to find events having only the id
     */
    findJustById?: Array<WebSocket['url']>;

    /**
     * override the default list of best relays to load a pubkey config, like
     * metadata (0), relay list (10002), blocked relay list (10006), search relay
     * list (10007), relays for dm (10050) 
     */
    getProfileConfig?: Array<WebSocket['url']>;

    /**
     * override the default list of best relays to find/discovery new notes
     */
    searchNotes?: Array<WebSocket['url']>;

    /**
     * override the default list of best relays to find/discovery new users
     */
    searchProfiles?: Array<WebSocket['url']>;
  }
}
