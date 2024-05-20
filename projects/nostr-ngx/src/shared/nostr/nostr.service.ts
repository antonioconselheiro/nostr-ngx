import { Injectable } from '@angular/core';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { Observable, Subject, takeUntil } from 'rxjs';
import { RelayService } from './relay.service';

@Injectable({
  providedIn: 'root'
})
export class NostrService {

  constructor(
    private relayService: RelayService
  ) { }

  request(filters: Filter[], relays?: string[]): Promise<Array<Event>> {
    const pool = new SimplePool();
    const events = new Array<Event>();
    relays = relays || this.relayService.getMyRelays();

    return new Promise(resolve => {
      const poolSubscription = pool.subscribeMany(
        relays, filters, {
          onevent: event => events.push(event),
          oneose(): void {
            poolSubscription.close();
            resolve(events);
          }
        }
      );
    });
  }

  observable(filters: Filter[], relays?: string[]): Observable<Event> {
    const pool = new SimplePool();
    relays = relays || this.relayService.getMyRelays();

    const subject = new Subject<Event>();
    const onDestroy$ = new Subject<void>();
    const poolSubscription = pool.subscribeMany(
      relays, filters, {
        onevent: event => subject.next(event),
        oneose(): void { }
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

  async publish(event: Event, relays?: string[]): Promise<void> {
    relays = relays || this.relayService.getDefaultWriteRelays();

    return Promise.all(
      new SimplePool().publish(relays, event)
    ).then(() => Promise.resolve());
  }
}
