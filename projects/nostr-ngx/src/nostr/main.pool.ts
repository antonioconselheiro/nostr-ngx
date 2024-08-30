import { Injectable } from '@angular/core';
import { NostrFilter, NPool, NRelay1 } from '@nostrify/nostrify';
import { OutboxStatefull } from './outbox.statefull';

@Injectable({
  providedIn: 'root'
})
export class MainPool extends NPool {

  constructor() {
    super({
      open: (url) => new NRelay1(url),
      reqRouter: (filters) => Promise.resolve(this.requestRouter(filters)),
      eventRouter: async () => OutboxStatefull.writeRelays
    });
  }

  private requestRouter(filters: NostrFilter[]): ReadonlyMap<WebSocket["url"], NostrFilter[]> {
    const relays: Array<[string, NostrFilter[]]> = OutboxStatefull.readRelays.map(relay => {
      return [ relay, filters ];
    });

    return new Map(relays);
  }
}
