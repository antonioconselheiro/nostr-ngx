import { Injectable } from '@angular/core';
import { finalize, Observable, Subject } from 'rxjs';
import { NostrEventWithOrigins } from '../domain/event/nostr-event-with-origins.interface';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from '../domain/nostrify/nostr-relay-message.type';
import { FacadeNPool } from './facade.npool';
import { PoolRequestOptions } from './pool-request.options';

@Injectable({
  providedIn: 'root'
})
export class NostrPool extends FacadeNPool {



  observe(filters: Array<NostrFilter>, opts: PoolRequestOptions = {}): Observable<NostrEventWithOrigins> {
    console.info('[[subscribe filter]]', filters);
    const controller = new AbortController();
    const subject = new Subject<NostrEventWithOrigins>();

    (async () => {
      for await (const msg of this.req(filters, opts)) {
        if (msg[0] === 'CLOSED') {
          subject.error(msg);
          break;
        } else if (msg[0] === 'EVENT') {
          //  FIXME: incluir relays de onde o evento foi coletado
          subject.next({ event: msg[2], origin: [] });
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
    opts?: PoolRequestOptions
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    return super.req(filters, opts);
  }

  mergeOptions(optsA?: PoolRequestOptions, optsB?: PoolRequestOptions): PoolRequestOptions {
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

  private mergeDefinedOptions(optsA: PoolRequestOptions, optsB: PoolRequestOptions): PoolRequestOptions {
    const ignoreCache = optsA.ignoreCache || optsB.ignoreCache || false;
    const include = [ ...optsA.include || [], ...optsB.include || [] ];
    const useOnly = [ ...optsA.useOnly || [], ...optsB.useOnly || [] ];

    const opts: PoolRequestOptions = {};

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
