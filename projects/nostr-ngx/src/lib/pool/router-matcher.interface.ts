import { NostrEvent } from "nostr-tools";
import { EventRouterMatcher } from "./event-router-matcher.interface";
import { RelayRecord } from "nostr-tools/relay";

export interface RouterMatcher {

  /**
   * found relays to publish an event
   */
  eventRouter: Array<EventRouterMatcher<NostrEvent>>;

  /**
   * List of relays to find users relay list
   */
  defaultDiscovery: () => Array<WebSocket['url']>;

  /**
   * list of relays when no relay was found
   */
  defaultFallback: () => RelayRecord;

  requestRouter: () => Promise<Array<WebSocket['url']>>;
}
