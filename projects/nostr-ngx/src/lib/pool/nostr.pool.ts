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

  //  TODO: verificar se a incrição e desinscrição estão funcionando corretamente
  observe(filters: Array<NostrFilter>, opts?: NPoolRequestOptions): Observable<NostrEvent> {
    const observable = from(this.req(filters, opts));
    const closedSignal$ = observable.pipe(
      filter(([kind]) => kind === 'CLOSED'),
      takeUntil(of(undefined)) 
    );

    const abort = new AbortController();
    opts = opts || {};

    closedSignal$.subscribe(() => abort.abort());
  
    return observable
      .pipe(
        filter(([kind]) => kind === 'EVENT'),
        takeUntil(closedSignal$)
      ).pipe(map(([,,event]) => event as NostrEvent));
  }

  override req(
    filters: Array<NostrFilter>,
    opts?: NPoolRequestOptions
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    return super.req(filters, opts);
  }
}
