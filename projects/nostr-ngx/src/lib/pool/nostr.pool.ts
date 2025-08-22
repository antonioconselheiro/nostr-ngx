import { Injectable } from '@angular/core';
import { finalize, Observable, Subject } from 'rxjs';
import { NostrEventWithOrigins } from '../domain/event/nostr-event-with-origins.interface';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { NostrStore } from '../domain/nostrify/nostr-store.type';
import { ClosedResultset } from '../domain/resultset/closed.resultset';
import { EoseResultset } from '../domain/resultset/eose.resultset';
import { EventResultset } from '../domain/resultset/event.resultset';
import { PoolRequestOptions } from './pool-request.options';

@Injectable({
  providedIn: 'root'
})
export class NostrPool implements NostrStore {

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
  ): AsyncIterable<EventResultset | EoseResultset | ClosedResultset> {
    return super.req(filters, opts);
  }
}
