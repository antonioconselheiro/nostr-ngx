import { Injectable } from '@angular/core';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { Observable, Subject, takeUntil } from 'rxjs';
import { RelayService } from './relay.service';
import { TRelayMap } from '../../domain/relay-map.type';

@Injectable({
  providedIn: 'root'
})
export class NostrService {

  constructor(
    private relayService: RelayService
  ) { }

  async request(filters: Filter[], relays?: TRelayMap): Promise<Array<Event>> {
    const pool = new SimplePool();
    const events = new Array<Event>();
    relays = relays || await this.relayService.getCurrentUserRelays();
    const relayList = this.relayService.filterReadableRelays(relays);

    return new Promise(resolve => {
      const poolSubscription = pool.subscribeMany(
        relayList, filters, {
        onevent: event => events.push(event),
        oneose(): void {
          poolSubscription.close();
          resolve(events);
        }
      }
      );
    });
  }

  observable(filters: Filter[], relays?: TRelayMap): Observable<Event> {
    const pool = new SimplePool();
    const subject = new Subject<Event>();
    const onDestroy$ = new Subject<void>();

    this.relayService
      .getCurrentUserRelays()
      .then(overrideRelays => {
        const relayList = this.relayService.filterReadableRelays(relays || overrideRelays);
        const poolSubscription = pool.subscribeMany(
          relayList, filters, {
          onevent: event => subject.next(event),
          oneose(): void { }
        }
        );

        onDestroy$.subscribe(() => {
          poolSubscription.close();
          onDestroy$.unsubscribe();
        });
      });

    return subject
      .asObservable()
      .pipe(takeUntil(onDestroy$));
  }

  async publish(event: Event, relays?: TRelayMap): Promise<void> {
    relays = relays || await this.relayService.getCurrentUserRelays();
    const relayList = this.relayService.filterWritableRelays(relays);

    return Promise.all(
      new SimplePool().publish(relayList, event)
    ).then(() => Promise.resolve());
  }
}
