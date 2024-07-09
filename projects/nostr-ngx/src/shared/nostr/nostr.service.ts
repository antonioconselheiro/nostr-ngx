import { Injectable } from '@angular/core';
import { Event, Filter, NostrEvent } from 'nostr-tools';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TRelayRecord } from '../../domain/relay-record.type';
import { PoolStatefull } from './pool.statefull';

/**
 * Interacts with pool relays, request data, subscribe filters and publish content
 */
@Injectable({
  providedIn: 'root'
})
export class NostrService {

  constructor(
    private poolStatefull: PoolStatefull
  ) { }

  request(filters: Filter[]): Promise<Array<Event>>
  request(filters: Filter[], relays: string[]): Promise<Array<Event>>
  request(filters: Filter[], relays: TRelayRecord): Promise<Array<Event>>
  request(filters: Filter[], relays?: TRelayRecord | string[]): Promise<Array<Event>>;
  async request(filters: Filter[], relays?: TRelayRecord | string[]): Promise<Array<Event>> {
    const pool = PoolStatefull.currentPool;
    const events = new Array<NostrEvent>();
    relays = relays || await this.poolStatefull.getCurrentUserRelays();
    const relayList = this.poolStatefull.filterReadableRelays(relays);
    console.debug('requesting in relays:', relayList, 'filters: ', filters);

    return new Promise(resolve => {
      const subscription = pool.subscribeMany(
        relayList, filters, {
        onevent: event => {
          console.debug('[onevent]', event);
          events.push(event);
        },
        onclose(reasons): void {
          console.debug('[onclose]', reasons);
        },
        oneose(): void {
          console.debug('[eose]', events);
          subscription.close();
          resolve(events);
        }
      });
    });
  }

  observable(filters: Filter[]): Observable<Event>;
  observable(filters: Filter[], relays?: string[]): Observable<Event>;
  observable(filters: Filter[], relays?: TRelayRecord): Observable<Event>;
  observable(filters: Filter[], relays?: TRelayRecord | string[]): Observable<Event>;
  observable(filters: Filter[], relays?: TRelayRecord | string[]): Observable<Event> {
    const pool = PoolStatefull.currentPool;
    const subject = new Subject<Event>();
    const onDestroy$ = new Subject<void>();

    this.poolStatefull
      .getCurrentUserRelays()
      .then(overrideRelays => {
        const relayList = this.poolStatefull.filterReadableRelays(relays || overrideRelays);
        const poolSubscription = pool.subscribeMany(
          relayList, filters, {
          onevent: event => subject.next(event),
          oneose(): void { }
        });

        onDestroy$.subscribe(() => {
          poolSubscription.close();
          onDestroy$.unsubscribe();
        });
      });

    return subject
      .asObservable()
      .pipe(takeUntil(onDestroy$));
  }

  publish(event: Event): Promise<void>;
  publish(event: Event, relays?: string[]): Promise<void>;
  publish(event: Event, relays?: TRelayRecord): Promise<void>;
  publish(event: Event, relays?: TRelayRecord | string[]): Promise<void>;
  async publish(event: Event, relays?: TRelayRecord | string[]): Promise<void> {
    const pool = PoolStatefull.currentPool;
    relays = relays || await this.poolStatefull.getCurrentUserRelays();
    const relayList = this.poolStatefull.filterWritableRelays(relays);

    // TODO: pode ser útil tratar individualmente os retornos, de forma a identificar
    //  quais relays concluiram corretamente e quais responderam com erro e qual erro
    return Promise.all(
      pool.publish(relayList, event)
    ).then(() => Promise.resolve());
  }
}
