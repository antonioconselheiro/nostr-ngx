import { NostrEvent } from "nostr-tools";
import { EventRouterMatcher } from "./event-router-matcher.interface";
import { RelayRecord } from "nostr-tools/relay";

export interface RouterMatcher {

  /**
   * list of relays when no relay was found
   */
  defaultFallback: () => RelayRecord;

  /**
   * List of relays to find users relay list
   */
  defaultSearch: () => Array<WebSocket['url']>;

  /**
   * found relays to publish an event
   */
  eventRouter: Array<EventRouterMatcher<NostrEvent>>;

  /**
   * relays to request
   */
  requestRouter: () => Promise<Array<WebSocket['url']>>;
}
