import { getFilterLimit } from 'nostr-tools';
import { finalize, Observable, Subject } from 'rxjs';
import { PoolRequestOptions } from './pool-request.options';
import { RelayRouterService } from './relay-router.service';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';
import { ClosedResultset } from '../domain/resultset/closed.resultset';
import { EoseResultset } from '../domain/resultset/eose.resultset';
import { EventWithRelaysResultset } from '../domain/resultset/event-with-relays.resultset';
import { NostrEventCollection } from '../domain/event/nostr-event.collection';
import { NostrEventIterable } from './nostr-event.iterable';
import { NostrFilter } from './nostr-filter.interface';
import { NostrRelay } from './nostr.relay';
import { Injectable } from '@angular/core';

@Injectable()
export class NostrPool {

  /**
   * Events are **regular**, which means they're all expected to be stored by relays.
   **/
  static regular(kind: number): boolean {
    return (1000 <= kind && kind < 10000) || [1, 2, 4, 5, 6, 7, 8, 16, 40, 41, 42, 43, 44].includes(kind);
  }

  /**
   * Events are **replaceable**, which means that, for each combination of `pubkey` and `kind`,
   * only the latest event is expected to (SHOULD) be stored by relays, older versions are
   * expected to be discarded.
   **/
  static replaceable(kind: number): boolean {
    return (10000 <= kind && kind < 20000) || [0, 3].includes(kind);
  }

  /**
   * Events are **ephemeral**, which means they are not expected to be stored by relays.
   **/
  static ephemeral(kind: number): boolean {
    return 20000 <= kind && kind < 30000;
  }

  /**
   * Events are **parameterized replaceable**, which means that, for each combination of
   * `pubkey`, `kind` and the `d` tag, only the latest event is expected to be stored by
   * relays, older versions are expected to be discarded.
   **/
  static parameterizedReplaceable(kind: number): boolean {
    return 30000 <= kind && kind < 40000;
  }
  
  private relays = new Map<RelayDomainString, NostrRelay>();

  constructor(
    private routerService: RelayRouterService
  ) { }

  observe(filters: Array<NostrFilter>, opts: PoolRequestOptions = {}): Observable<NostrEventWithRelays> {
    console.info('[[subscribe filter]]', filters);
    const controller = new AbortController();
    const signal = opts?.signal ? AbortSignal.any([opts.signal, controller.signal]) : controller.signal;
    const subject = new Subject<NostrEventWithRelays>();

    (async () => {
      for await (const msg of this.req(filters, signal)) {
        if (msg[0] === 'CLOSED') {
          subject.error(msg);
          break;
        } else if (msg[0] === 'EVENT_WITH_RELAYS') {
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

  /** Get or create a relay instance for the given URL. */
  relay(url: RelayDomainString): NostrRelay {
    const relay = this.relays.get(url);

    if (relay) {
      return relay;
    } else {
      const relay = new NostrRelay(url);
      this.relays.set(url, relay);
      return relay;
    }
  }

  async *req(
    filters: NostrFilter[],
    signal?: AbortSignal
  ): AsyncIterable<EventWithRelaysResultset | EoseResultset | ClosedResultset> {
    const controller = new AbortController();
    signal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    const routes = await this.routerService.reqRouter(filters);
    if (routes.size < 1) {
      return;
    }

    const poolIterable = new NostrEventIterable<EventWithRelaysResultset | EoseResultset | ClosedResultset>(signal);
    const eoses = new Set<RelayDomainString>();
    const closes = new Set<RelayDomainString>();

    for (const url of routes.keys()) {
      this.requestRelay(
        url, filters, routes, poolIterable, eoses, closes, signal
      ).catch(e => console.error(' :: error iterating events: ', e));
    }

    try {
      for await (const msg of poolIterable) {
        yield msg;
      }
    } finally {
      controller.abort();
    }
  }

  private async requestRelay(
    url: RelayDomainString,
    filters: NostrFilter[],
    routes: ReadonlyMap<RelayDomainString, NostrFilter[]>,
    iterable: NostrEventIterable<EventWithRelaysResultset | EoseResultset | ClosedResultset>,
    eoses: Set<RelayDomainString>,
    closes: Set<RelayDomainString>,
    signal?: AbortSignal
  ): Promise<void> {
    const relay = this.relay(url);
    for await (const msg of relay.req(filters, { signal })) {
      if (msg[0] === 'EOSE') {
        eoses.add(url);
        if (eoses.size === routes.size) {
          iterable.push(msg);
        }
      } else if (msg[0] === 'CLOSED') {
        closes.add(url);
        if (closes.size === routes.size) {
          iterable.push(msg);
        }
      } else if (msg[0] === 'EVENT_WITH_RELAYS') {
        iterable.push(msg);
      }
    }
  }

  async publish(event: NostrEvent, signal?: AbortSignal): Promise<void> {
    const relayUrls = await this.routerService.eventRouter(event);
    if (!relayUrls.length) {
      return Promise.resolve();
    }

    await Promise.any(
      relayUrls.map((url) => this.relay(url).publish(event, signal)),
    );
  }

  async query(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<NostrEventWithRelays[]> {
    const events = new NostrEventCollection();

    const limit = filters.reduce((result, filter) => result + getFilterLimit(filter), 0);
    if (limit === 0) {
      return [];
    }

    const replaceable = filters.reduce((result, filter) => {
      return result || !!filter.kinds?.some((k) => NostrPool.replaceable(k) || NostrPool.parameterizedReplaceable(k));
    }, false);

    try {
      for await (const msg of this.req(filters, opts?.signal)) {
        if (msg[0] === 'EOSE') {
          break;
        } else if (msg[0] === 'EVENT_WITH_RELAYS') {
          events.add(msg[2]);
        } else if (msg[0] === 'CLOSED') {
          throw new Error('Subscription closed');
        } else if (!replaceable && (events.size >= limit)) {
          break;
        }
      }
    } catch {
      // Skip errors, return partial results.
    }

    return [...events];
  }
}
