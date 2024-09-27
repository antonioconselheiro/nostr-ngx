import { NostrEvent } from "nostr-tools";
import { EventRouterMatcher } from "./event-router-matcher.interface";
import { RelayRecord } from "nostr-tools/relay";

export interface RouterMatcher {

  /**
   * found relays to publish an event
   */
  eventRouter: Array<EventRouterMatcher<NostrEvent>>;
  
  /**
   * list of relays when no relay was found
   */
  defaultFallback: () => RelayRecord;

  /**
   * List of relays to find users relay list
   */
  defaultSearch: () => Array<WebSocket['url']>;

  /**
   * relays to request
   */
  requestRouter: () => Promise<Array<WebSocket['url']>>;
}
