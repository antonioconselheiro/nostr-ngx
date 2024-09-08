import { Injectable } from "@angular/core";
import { NpoolOutboxOptions } from "./npool-outbox.options";
import { NostrEvent, NostrFilter, NRelay, NRelay1 } from "@nostrify/nostrify";
import { NPoolRequestOptions } from "./npool-request.options";

@Injectable()
export class OutboxService implements NpoolOutboxOptions {
  static readRelays: Array<WebSocket["url"]> = [];
  static writeRelays: Array<WebSocket["url"]> = [];

  open(url: WebSocket["url"]): NRelay {
    return new NRelay1(url);
  }

  async eventRouter(event: NostrEvent, opts?: NPoolRequestOptions): Promise<WebSocket["url"][]> {
    return OutboxService.writeRelays;
  }

  async reqRouter(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<ReadonlyMap<WebSocket["url"], NostrFilter[]>> {
    const relays: Array<[string, NostrFilter[]]> = OutboxService.readRelays.map(relay => {
      return [ relay, filters ];
    });
  
    return new Map(relays);
    
  }
}
