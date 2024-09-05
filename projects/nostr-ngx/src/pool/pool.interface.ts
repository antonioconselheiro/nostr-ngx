import { NostrEvent, NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT, NRelay } from '@nostrify/nostrify';
import { Observable } from 'rxjs';

/**
 * websocket pool with rxjs observables
 * this pool must be able to receive an event as relay hint, or a list of relays
 */
export interface IPool {
  relay(url: WebSocket['url']): NRelay;
  req(filters: NostrFilter[], opts?: { signal?: AbortSignal, hint?: Array<NostrEvent> | Array<WebSocket['url']> }): Observable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED>;
  event(event: NostrEvent, opts?: { signal?: AbortSignal, hint?: Array<NostrEvent> | Array<WebSocket['url']> }): Promise<void>;
  query(filters: NostrFilter[],
    
    opts?: {
      signal?: AbortSignal,
      hint?: Array<NostrEvent> | Array<WebSocket['url']>
    }
  
  ): Promise<NostrEvent[]>;
}