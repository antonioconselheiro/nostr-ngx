import { Injectable } from '@angular/core';
import { Event, Filter, NostrEvent, SimplePool } from 'nostr-tools';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TRelayMap } from '../../domain/relay-map.type';
import { PoolStatefull } from './pool.statefull';

@Injectable({
  providedIn: 'root'
})
export class NostrService {

  constructor(
    private poolStatefull: PoolStatefull
  ) { }

  async request(filters: Filter[], relays?: TRelayMap | string[]): Promise<Array<Event>> {
    const pool = new SimplePool();
    const events = new Array<NostrEvent>();
    relays = relays || await this.poolStatefull.getCurrentUserRelays();
    const relayList = this.poolStatefull.filterReadableRelays(relays);
    console.debug('relays:', relayList)

    return new Promise(resolve => {
      const poolSubscription = pool.subscribeMany(
        relayList, filters, {
        onevent: event => {
          console.debug('[onevent]', event)
          events.push(event)
        },
        onclose(reasons): void {
          console.debug('[onclose]', reasons);
        },
        oneose(): void {
          console.debug('[eose]', events);
          poolSubscription.close();
          resolve(events);
        }
      });
    });
  }

  observable(filters: Filter[], relays?: TRelayMap | string[]): Observable<Event> {
    const pool = new SimplePool();
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

  async publish(event: Event, relays?: TRelayMap | string[]): Promise<void> {
    relays = relays || await this.poolStatefull.getCurrentUserRelays();
    const relayList = this.poolStatefull.filterWritableRelays(relays);

    return Promise.all(
      new SimplePool().publish(relayList, event)
    ).then(() => Promise.resolve());
  }
}
