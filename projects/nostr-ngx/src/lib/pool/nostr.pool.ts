import { Inject, Injectable } from '@angular/core';
import { NCache, NostrEvent, NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from '@nostrify/nostrify';
import { filter, from, map, Observable, of, takeUntil } from 'rxjs';
import { MAIN_NCACHE_TOKEN } from '../injection-token/main-ncache.token';
import { FacadeNPool } from './facade.npool';
import { NPoolRequestOptions } from './npool-request.options';
import { RelayRouterService } from './relay-router.service';

// TODO: pool must be able to identify relay connection status
/**
 * This class helps you interact with a websocket pool. 
 * "Clients SHOULD open a single websocket connection to each relay and use it for all their subscriptions."
 * https://github.com/nostr-protocol/nips/blob/master/01.md#communication-between-clients-and-relays
 */
@Injectable({
  providedIn: 'root'
})
export class NostrPool extends FacadeNPool {

  constructor(
    routerService: RelayRouterService,
    @Inject(MAIN_NCACHE_TOKEN) protected override ncache: NCache
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

  mergeOptions(optsA?: NPoolRequestOptions, optsB?: NPoolRequestOptions): NPoolRequestOptions {
    if (optsA && optsB) {
      return this.mergeDefinedOptions(optsA, optsB);
    } else if (optsA) {
      return optsA;
    } else if (optsB) {
      return optsB;
    } else {
      return {};
    }
  }

  // FIXME: solve cyclomatic complexity for this method by spliting it in minor pieces of logic
  // eslint-disable-next-line complexity
  private mergeDefinedOptions(optsA: NPoolRequestOptions, optsB: NPoolRequestOptions): NPoolRequestOptions {
    const ignoreCache = optsA.ignoreCache || optsB.ignoreCache || false;
    const include = [ ...optsA.include || [], ...optsB.include || [] ];
    const useOnly = [ ...optsA.useOnly || [], ...optsB.useOnly || [] ];

    //  FIXME: not the best way of merging it, but solving this is not priority
    const signal = optsA.signal || optsB.signal;

    const opts: NPoolRequestOptions = {};
    if (ignoreCache) {
      opts.ignoreCache = true;
    }

    if (include.length) {
      opts.include = include;
    }

    if (useOnly.length) {
      opts.useOnly = useOnly;
    }

    if (signal) {
      opts.signal = signal;
    }

    return opts;
  }
}
