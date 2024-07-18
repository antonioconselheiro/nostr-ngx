import { Injectable } from '@angular/core';
import { Event, Filter, NostrEvent } from 'nostr-tools';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TRelayMetadataRecord } from '../../domain/relay-metadata.record';
import { MainPoolStatefull } from './main-pool.statefull';
import { AbstractSimplePool } from 'nostr-tools/pool'
import { RelayService } from './relay.service';

/**
 * Interacts with pool relays, request data, subscribe filters and publish content
 */
@Injectable({
  providedIn: 'root'
})
export class NostrService {

  constructor(
    private relayService: RelayService
  ) { }

  async request(filters: Filter[], pool?: AbstractSimplePool): Promise<Array<Event>> {
    const events = new Array<NostrEvent>();
    pool = pool || MainPoolStatefull.currentPool;
    console.debug('requesting in pool:', pool, 'filters: ', filters);

    return new Promise(resolve => {
      const subscription = pool.subscribeMany(
        (pool as any).relays, filters, {
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

  observable(filters: Filter[], pool?: AbstractSimplePool): Observable<Event> {
    pool = pool || MainPoolStatefull.currentPool;
    const subject = new Subject<Event>();
    const onDestroy$ = new Subject<void>();

    const poolSubscription = pool.subscribeMany(
      (pool as any).relays, filters, {
      onevent: event => subject.next(event),
      oneose(): void { }
    });

    onDestroy$.subscribe(() => {
      poolSubscription.close();
      onDestroy$.unsubscribe();
    });

    return subject
      .asObservable()
      .pipe(takeUntil(onDestroy$));
  }

  publish(event: Event): Promise<void>;
  publish(event: Event, relays?: string[]): Promise<void>;
  publish(event: Event, relays?: TRelayMetadataRecord): Promise<void>;
  publish(event: Event, relays?: TRelayMetadataRecord | string[]): Promise<void>;
  async publish(event: Event, relays?: TRelayMetadataRecord | string[]): Promise<void> {
    const pool = MainPoolStatefull.currentPool;
    relays = relays || await this.relayService.getCurrentUserRelays();
    const relayList = this.relayService.filterWritableRelays(relays);

    // TODO: pode ser útil tratar individualmente os retornos, de forma a identificar
    //  quais relays concluiram corretamente e quais responderam com erro e qual erro
    return Promise.all(
      pool.publish(relayList, event)
    ).then(() => Promise.resolve());
  }
}
