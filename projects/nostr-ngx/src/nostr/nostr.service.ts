import { Injectable } from '@angular/core';
import { Filter, NostrEvent } from 'nostr-tools';
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

  private getPoolAndRelays(definitivePool?: AbstractSimplePool | string[], definitiveRelays?: string[]): {
    definitivePool: AbstractSimplePool,
    definitiveRelays: string[]
  } {
    if (definitivePool instanceof Array) {
      return {
        definitivePool: MainPoolStatefull.currentPool,
        definitiveRelays: definitivePool
      };
    }

    if (!definitivePool) {
      definitivePool = MainPoolStatefull.currentPool;
    }

    return {
      definitivePool, definitiveRelays: definitiveRelays ? (definitivePool as any).relays : definitiveRelays
    }
  }

  async request(filters: Filter[], pool?: AbstractSimplePool | string[], relays?: string[]): Promise<Array<NostrEvent>> {
    const events = new Array<NostrEvent>();
    const { definitivePool, definitiveRelays } = this.getPoolAndRelays(pool, relays);
    console.debug('requesting in pool:', definitivePool, 'using relays:', definitiveRelays, 'filters: ', filters);

    return new Promise(resolve => {
      const subscription = definitivePool.subscribeMany(definitiveRelays, filters, {
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

  observable(filters: Filter[], pool?: AbstractSimplePool | string[], relays?: string[]): Observable<NostrEvent> {
    const { definitivePool, definitiveRelays } = this.getPoolAndRelays(pool, relays);
    const subject = new Subject<NostrEvent>();
    const onDestroy$ = new Subject<void>();

    const poolSubscription = definitivePool.subscribeMany(
      definitiveRelays, filters, {
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

  async publish(event: NostrEvent, pool?: AbstractSimplePool | string[], relays?: string[]): Promise<void> {
    const { definitivePool, definitiveRelays } = this.getPoolAndRelays(pool, relays);

    // TODO: pode ser útil tratar individualmente os retornos, de forma a identificar
    //  quais relays concluiram corretamente e quais responderam com erro e qual erro
    return Promise.all(
      definitivePool.publish(definitiveRelays, event)
    ).then(() => Promise.resolve());
  }
}
