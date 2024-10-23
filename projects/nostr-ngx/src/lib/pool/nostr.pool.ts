import { Inject, Injectable } from '@angular/core';
import { NCache, NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from '@nostrify/nostrify';
import { finalize, Observable, Subject } from 'rxjs';
import { MAIN_NCACHE_TOKEN } from '../injection-token/main-ncache.token';
import { FacadeNPool } from './facade.npool';
import { NPoolRequestOptions } from './npool-request.options';
import { RelayRouterService } from './relay-router.service';
import { NostrEvent } from '../domain/nostr-event.interface';

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

  observe(filters: Array<NostrFilter>, opts: NPoolRequestOptions = {}): Observable<NostrEvent> {
    console.info('[[subscribe filter]]', filters);
    const controller = new AbortController();
    const signal = opts?.signal ? AbortSignal.any([opts.signal, controller.signal]) : controller.signal;
    opts.signal = signal;
    const subject = new Subject<NostrEvent>();

    (async () => {
      for await (const msg of this.req(filters, opts)) {
        if (msg[0] === 'CLOSED') {
          subject.error(msg);
          break;
        } else if (msg[0] === 'EVENT') {
          subject.next(msg[2]);
        }
      }
    })();
  
    return subject
      .asObservable()
      .pipe(
        finalize(() => {
          console.info('[[unsubscribe filter]]', filters);
          controller.abort();
        })
      );
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
    let signal: AbortSignal | null = null;
    if (optsA.signal && optsB.signal) {
      signal = AbortSignal.any([optsA.signal, optsB.signal]);
    } else if (optsA.signal) {
      signal = optsA.signal;
    } else if (optsB.signal) {
      signal = optsB.signal;
    }

    const opts: NPoolRequestOptions = {};
    if (signal) {
      opts.signal = signal;
    }

    if (ignoreCache) {
      opts.ignoreCache = true;
    }

    if (include.length) {
      opts.include = include;
    }

    if (useOnly.length) {
      opts.useOnly = useOnly;
    }

    return opts;
  }
}
