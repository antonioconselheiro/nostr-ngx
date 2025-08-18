import { NostrEvent } from '../domain/event/nostr-event.interface';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';

export interface EventRouterMatcher<T extends NostrEvent> {
  /**
   * function to identify if event matches with this routing fn
   */
  matcher?: ((event: NostrEvent) => event is T) | ((event: NostrEvent) => boolean);

  /**
   * custom routes for this match
   */
  router: (event: T) => Promise<Array<RelayDomainString>>;
}
