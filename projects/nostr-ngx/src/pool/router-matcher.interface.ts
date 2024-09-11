import { NostrEvent } from "nostr-tools";
import { EventRouterMatcher } from "./event-router-matcher.interface";

export interface RouterMatcher {

  /**
   * List of relays to find users relay list
   */
  defaultDiscovery: Array<WebSocket['url']>;

  /**
   * list of relays when no relay was found
   */
  defaultFallback: Array<WebSocket['url']>;

  /**
   * found relays to publish an event
   */
  eventRouter: Array<EventRouterMatcher<NostrEvent>>;

  requestRouter: () => Promise<Array<WebSocket['url']>>;
}
