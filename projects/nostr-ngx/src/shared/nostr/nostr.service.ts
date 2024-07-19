import { Injectable } from '@angular/core';
import { Event, Filter, NostrEvent } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/pool';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MainPoolStatefull } from './main-pool.statefull';

/**
 * Interacts with pool relays, request data, subscribe filters and publish content
 */
@Injectable({
  providedIn: 'root'
})
export class NostrService {

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

  async publish(event: Event, pool?: AbstractSimplePool): Promise<void> {
    pool = pool || MainPoolStatefull.currentPool;

    // TODO: pode ser útil tratar individualmente os retornos, de forma a identificar
    //  quais relays concluiram corretamente e quais responderam com erro e qual erro
    return Promise.all(
      pool.publish((pool as any).relay, event)
    ).then(() => Promise.resolve());
  }
}
