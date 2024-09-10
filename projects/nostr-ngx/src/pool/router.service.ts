import { Injectable } from '@angular/core';
import { NostrEvent, NostrFilter, NRelay, NRelay1 } from '@nostrify/nostrify';
import { kinds as NostrEventKind } from 'nostr-tools';
import { ProfilePointer } from 'nostr-tools/nip19';
import { DefaultRouterMatcher } from './default.router-matcher';
import { NPoolRequestOptions } from './npool-request.options';
import { NpoolRouterOptions } from './npool-router.options';

@Injectable()
export class RouterService implements NpoolRouterOptions {

  constructor(
    private routerMatcher: DefaultRouterMatcher
  ) { }

  open(url: WebSocket["url"]): NRelay {
    return new NRelay1(url);
  }

  async eventRouter(event: NostrEvent, opts?: NPoolRequestOptions): Promise<Array<WebSocket["url"]>> {
    if (opts?.useOnly) {
      const usingOnly = this.parseRelayList(opts?.useOnly, 'w');
      if (usingOnly.length) {
        return usingOnly;
      } else {
        return this.routerMatcher.defaultFallback;
      }
    }

    const relayHint = this.parseRelayList(opts?.include, 'w');
    const router = this.routerMatcher.eventRouter.find(matcher => (matcher.match && matcher.match(event) || !matcher.match) && matcher.router);
    let relays: Array<WebSocket["url"]> = [];
    if (router) {
      relays = await router.router(event);
    }

    return [...relayHint, ...relays];
  }

  async reqRouter(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<ReadonlyMap<WebSocket["url"], NostrFilter[]>> {
    

    const relays: Array<[string, NostrFilter[]]> = RouterService.readRelays.map(relay => {
      return [ relay, filters ];
    });
  
    return new Map(relays);
  }

  private parseRelayList(list?: Array<WebSocket['url'] | NostrEvent | ProfilePointer>, operation: 'w' | 'r'): Array<WebSocket["url"]> {
    const parsed = new Array<WebSocket["url"]>;

    if (!list?.length) {
      return [];
    }

    list.forEach(stuff => {
      if (typeof stuff === 'string') {
        parsed.push(stuff);
      } else if ('id' in stuff) {
        if (stuff.kind === NostrEventKind.RelayList) {
          n.outbox().parse(stuff);
        } else {
          n.relays().parse(stuff);
        }
      } else {
        (stuff.relays || []).forEach(r => parsed.push(r));
      }
    });

    return parsed;
  }
}
