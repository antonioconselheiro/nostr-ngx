import { NostrEvent } from "@nostrify/nostrify";

export interface IRouterMatcher {

  /**
   * list of relays when no relay was found
   */
  defaultFallback: Array<WebSocket['url']>;

  /**
   * found relays to publish an event
   */
  eventRouter: Array<{
    /**
     * function to identify if event matches with this routing fn
     */
    matcher?: (event: NostrEvent) => boolean,

    /**
     * custom routes for this match
     */
    router: (event: NostrEvent) => Promise<Array<WebSocket['url']>>
  }>;

  requestRouter: () => Promise<Array<WebSocket['url']>>;
}