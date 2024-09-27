import { Inject, Injectable } from '@angular/core';
import { NCache, NostrEvent, NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from '@nostrify/nostrify';
import { filter, from, map, Observable, of, takeUntil } from 'rxjs';
import { MAIN_NCACHE_TOKEN } from '../injection-token/main-ncache.token';
import { FacadeNPool } from './facade.npool';
import { NPoolRequestOptions } from './npool-request.options';
import { RelayRouterService } from './relay-router.service';

// TODO: pool must be able to identify relay connection status
/**
 * "Clients SHOULD open a single websocket connection to each relay and use it for all their subscriptions."
 * https://github.com/nostr-protocol/nips/blob/master/01.md#communication-between-clients-and-relays
 */
@Injectable({
  providedIn: 'root'
})
export class NostrPool extends FacadeNPool {

  constructor(
    routerService: RelayRouterService,
    @Inject(MAIN_NCACHE_TOKEN) protected override readonly ncache: NCache
  ) {
    super(routerService, ncache);
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
