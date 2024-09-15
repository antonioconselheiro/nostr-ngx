import { Inject, Injectable } from '@angular/core';
import { NCache, NostrEvent, NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT, NStore } from '@nostrify/nostrify';
import { filter, from, map, Observable, of, takeUntil } from 'rxjs';
import { RouterService } from './router.service';
import { FacadeNPool } from './facade.npool';
import { IO_CACHE_NSTORE_TOKEN } from '../injection-token/io-cache-nstore.token';
import { NPoolRequestOptions } from './npool-request.options';
import { IN_MEMORY_NCACHE_TOKEN } from '../injection-token/in-memory-ncache.token';

/**
 * "Clients SHOULD open a single websocket connection to each relay and use it for all their subscriptions."
 * https://github.com/nostr-protocol/nips/blob/master/01.md#communication-between-clients-and-relays
 */
@Injectable({
  providedIn: 'root'
})
export class NostrPool extends FacadeNPool {

  constructor(
    routerService: RouterService,
    @Inject(IO_CACHE_NSTORE_TOKEN) protected override readonly nstore: NStore,
    @Inject(IN_MEMORY_NCACHE_TOKEN) protected override readonly ncache: NCache
  ) {
    super(routerService, nstore, ncache);
  }

  observe(filters: Array<NostrFilter>): Observable<NostrEvent> {
    const observable = from(this.req(filters));
    const closedSignal$ = observable.pipe(
      filter(([kind]) => kind === 'CLOSED'),
      takeUntil(of(undefined)) 
    );
  
    return observable
      .pipe(
        filter(([kind]) => kind === 'EVENT'),
        takeUntil(closedSignal$)
      ).pipe(map(([,,event]) => event as NostrEvent));
  }

  override req(
    filters: NostrFilter[],
    opts?: NPoolRequestOptions,
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    return super.req(filters, opts);
  }
}
