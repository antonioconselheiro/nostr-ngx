import { NostrFilter, NPoolOpts } from '@nostrify/nostrify';
import { NPoolRequestOptions } from './npool-request.options';
import { NostrEvent } from '../domain/event/nostr-event.interface';

export interface NpoolRouterOptions extends NPoolOpts {

  reqRouter(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<ReadonlyMap<WebSocket['url'], NostrFilter[]>>;
  
  eventRouter(event: NostrEvent, opts?: NPoolRequestOptions): Promise<WebSocket['url'][]>;

}