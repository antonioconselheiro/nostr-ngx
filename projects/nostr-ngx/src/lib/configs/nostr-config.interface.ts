import { RelayRecord } from 'nostr-tools/relay';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';

export interface NostrConfig {
  defaultProfile?: {
    picture: string;
    banner: string;
  };

  /**
   * relays fallback if user has no relay list or if there is no authenticated account,
   * user custom configs from localStorage will override this list 
   */
  defaultFallback?: RelayRecord;

  /**
   * relays fallback if user has no search relay publically configured,
   * these relays should help discovery new users and new notes 
   */
  searchFallback?: Array<RelayDomainString>;

  bestFor?: {
    /**
     * override the default list of best relays to find events having only the id
     */
    findJustById?: Array<RelayDomainString>;

    /**
     * override the default list of best relays to load a pubkey config, like
     * metadata (0), relay list (10002), blocked relay list (10006), search relay
     * list (10007), relays for dm (10050) 
     */
    findProfileConfig?: Array<RelayDomainString>;
  };
}
