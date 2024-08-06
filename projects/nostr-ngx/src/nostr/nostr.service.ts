import { Injectable, Optional } from '@angular/core';
import { Filter, NostrEvent } from 'nostr-tools';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SmartPool } from '../pool/smart.pool';
import { MainPool } from './main.pool';

/**
 * Interacts with pool relays, request data, subscribe filters and publish content
 */
@Injectable({
  providedIn: 'root'
})
export class NostrService {

  constructor(
    @Optional()
    private pool: MainPool
  ) { }

  async request(
    filters: Filter[],

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool?: SmartPool
  ): Promise<Array<NostrEvent>> {
    const events = new Array<NostrEvent>();
    pool = pool || this.pool;
    console.debug('requesting in pool:', pool, 'filters: ', filters);

    return new Promise(resolve => {
      const subscription = pool.subscribeMany(filters, {
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

  observable(
    filters: Filter[],

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool?: SmartPool
  ): Observable<NostrEvent> {
    pool = pool || this.pool;
    const subject = new Subject<NostrEvent>();
    const onDestroy$ = new Subject<void>();
    console.debug('subscribing in pool:', pool, 'filters: ', filters);

    const poolSubscription = pool.subscribeMany(
      filters, {
        onevent: event => subject.next(event)
      }
    );

    onDestroy$.subscribe(() => {
      poolSubscription.close();
      onDestroy$.unsubscribe();
    });

    return subject
      .asObservable()
      .pipe(takeUntil(onDestroy$));
  }

  async publish(
    event: NostrEvent,

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool?: SmartPool
  ): Promise<void> {
    pool = pool || this.pool;
    console.debug('publishing in pool:', pool, 'event: ', event);

    // TODO: pode ser útil tratar individualmente os retornos, de forma a identificar
    //  quais relays concluiram corretamente e quais responderam com erro e qual erro
    return Promise.all(
      pool.publish(event)
    ).then(() => Promise.resolve());
  }
}
