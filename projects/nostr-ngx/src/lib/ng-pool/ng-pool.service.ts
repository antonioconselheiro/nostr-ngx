import { Injectable } from '@angular/core';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { PoolRequestOptions } from '../pool/pool-request.options';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class NgPoolService {

  constructor() { }

  observe(filters: Array<NostrFilter>, opts: PoolRequestOptions = {}): Observable<NostrEventWithRelays> {
    
  }
}
