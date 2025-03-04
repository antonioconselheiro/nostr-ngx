import { Inject, Injectable } from '@angular/core';
import { NostrFilter, NRelay, NRelay1 } from '@nostrify/nostrify';
import { kinds as NostrEventKind } from 'nostr-tools';
import { ProfilePointer } from 'nostr-tools/nip19';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { NPoolRequestOptions } from './npool-request.options';
import { NpoolRouterOptions } from './npool-router.options';
import { RelayLocalConfigService } from './relay-local-config.service';
import { RouterMatcher } from './router-matcher.interface';
import { RELAY_ROUTER_TOKEN } from '../injection-token/relay-router.token';
import { NostrEvent } from '../domain/event/nostr-event.interface';

/**
 * TODO: incluir mecânica para remover relays que estiverem na lista de bloqueio do usuário
 */
@Injectable()
export class RelayRouterService implements NpoolRouterOptions {

  constructor(
    private nostrGuard: NostrGuard,
    private relayConverter: RelayConverter,
    private relayConfigService: RelayLocalConfigService,
    @Inject(RELAY_ROUTER_TOKEN) private routerMatcher: RouterMatcher
  ) { }

  open(url: WebSocket["url"]): NRelay {
    return new NRelay1(url);
  }

  //  TODO: deve-se ler primeiro do `include` (relay hint) e depois deve-se verificar se os eventos
  //  retornados atingiram o limit, se sim, então encerra-se, se não, deve se consultar o resto dos
  //  relays da pool e tratar deduplicação
  //  TODO: https://github.com/soapbox-pub/nostrify/issues/2 
  async eventRouter(event: NostrEvent, opts?: NPoolRequestOptions): Promise<Array<WebSocket["url"]>> {
    if (opts?.useOnly) {
      const usingOnly = this.parseRelayList(opts?.useOnly);
      if (usingOnly.length) {
        return usingOnly;
      }
    }

    const include = this.parseRelayList(opts?.include);
    const router = this.routerMatcher.eventRouter.find(matcher => (matcher.matcher && matcher.matcher(event) || !matcher.matcher) && matcher.router);
    let relays: Array<WebSocket["url"]> = [];
    if (router) {
      relays = await router.router(event);
    }

    const routes = [...include, ...relays];
    if (routes.length) {
      console.info(`routing event to `, routes, event);
      return Promise.resolve(routes);
    } else {
      const outbox = this.relayConverter.extractOutboxRelays({
        general: this.routerMatcher.defaultFallback()
      });
      console.info(`routing event to `, outbox, event);
      return outbox;
    }
  }

  async reqRouter(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<ReadonlyMap<WebSocket["url"], NostrFilter[]>> {
    let relays = new Array<WebSocket['url']>();
    if (opts?.useOnly) {
      relays = this.parseRelayList(opts?.useOnly);
    } else {
      const record = await this.relayConfigService.getCurrentUserRelays();
      if (record && record.general) {
        const general = record.general;
        relays = Object.keys(general).filter(url => general[url].read);
      }
    }

    if (!relays.length) {
      relays = this.relayConverter.extractInboxRelays({
        general: this.routerMatcher.defaultFallback()
      });
    }

    const subscriptions: Array<[string, NostrFilter[]]> = relays.map(relay => {
      return [ relay, filters ];
    });
  
    return new Map(subscriptions);
  }

  private parseRelayList(list?: Array<WebSocket['url'] | NostrEvent | ProfilePointer | undefined | null>): Array<WebSocket["url"]> {
    let parsed = new Array<WebSocket["url"]>;

    if (!list?.length) {
      return [];
    }

    list.forEach(stuff => {
      if (!stuff) {
        return;
      } else if (typeof stuff === 'string') {
        parsed.push(stuff);
      } else if ('id' in stuff) {
        if (!this.nostrGuard.isKind(stuff, NostrEventKind.RelayList)) {
          parsed = [
            ...parsed,
            ...this.relayConverter.convertEventToRelayList(stuff)
          ];
        } else {
          console.warn(
            '10002 relay list was given as relay hint and was ignored, you must extract relays ' +
            'from this event using RelayConverter#convertRelayListEventToRelayRecord'
          );
        }
      } else {
        (stuff.relays || []).forEach(r => parsed.push(r));
      }
    });

    return parsed;
  }
}
