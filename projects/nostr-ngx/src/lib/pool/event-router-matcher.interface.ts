import { NostrEvent } from "../domain/nostr-event.interface";

export interface EventRouterMatcher<T extends NostrEvent> {
  /**
   * function to identify if event matches with this routing fn
   */
  matcher?: ((event: NostrEvent) => event is T) | ((event: NostrEvent) => boolean);

  /**
   * custom routes for this match
   */
  router: (event: T) => Promise<Array<WebSocket['url']>>;
}
