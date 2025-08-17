import { Inject, Injectable } from '@angular/core';
import { nip19, kinds as NostrEventKind } from 'nostr-tools';
import { NProfile, ProfilePointer } from 'nostr-tools/nip19';
import { NostrEventOrigins } from '../domain/event/nostr-event-origins.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { RelayDomain } from '../domain/event/relay-domain.interface';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { NRelay } from '../domain/nostrify/nrelay';
import { NRelay1 } from '../domain/nostrify/nrelay1';
import { RELAY_ROUTER_TOKEN } from '../injection-token/relay-router.token';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { NPoolRequestOptions } from './npool-request.options';
import { NpoolRouterOptions } from './npool-router.options';
import { RelayLocalConfigService } from './relay-local-config.service';
import { RouterMatcher } from './router-matcher.interface';

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

  open(url: RelayDomain): NRelay {
    return new NRelay1(url);
  }

  //  TODO: deve-se ler primeiro do `include` (relay hint) e depois deve-se verificar se os eventos
  //  retornados atingiram o limit, se sim, então encerra-se, se não, deve se consultar o resto dos
  //  relays da pool e tratar deduplicação
  //  TODO: https://github.com/soapbox-pub/nostrify/issues/2 
  async eventRouter(origins: NostrEventOrigins, opts?: NPoolRequestOptions): Promise<Array<RelayDomain>> {
    if (opts?.useOnly) {
      const usingOnly = this.parseRelayList(opts?.useOnly);
      if (usingOnly.length) {
        return usingOnly;
      }
    }

    const include = this.parseRelayList(opts?.include);
    const router = this.routerMatcher.eventRouter.find(matcher => (matcher.matcher && matcher.matcher(origins.event) || !matcher.matcher) && matcher.router);
    let relays: Array<RelayDomain> = [];
    if (router) {
      relays = await router.router(origins.event);
    }

    const routes = [...include, ...relays];
    if (routes.length) {
      console.info(`routing event to `, routes, origins);
      return Promise.resolve(routes);
    } else {
      const outbox = this.relayConverter.extractOutboxRelays({
        general: this.routerMatcher.defaultFallback()
      });
      console.info(`routing event to `, outbox, origins);
      return outbox;
    }
  }

  async reqRouter(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<ReadonlyMap<RelayDomain, NostrFilter[]>> {
    let relays = new Array<RelayDomain>();
    if (opts?.useOnly) {
      relays = this.parseRelayList(opts?.useOnly);
    } else {
      const record = await this.relayConfigService.getCurrentUserRelays();
      if (record && record.general) {
        const general = record.general;
        relays = Object.keys(general).filter((url): url is RelayDomain => {
          if (this.nostrGuard.isRelayString(url)) {
            return general[url].read;
          }

          return false;
        });
      }
    }

    if (!relays.length) {
      relays = this.relayConverter.extractInboxRelays({
        general: this.routerMatcher.defaultFallback()
      });
    }

    const subscriptions: Array<[RelayDomain, NostrFilter[]]> = relays.map(relay => {
      return [ relay, filters ];
    });
  
    return new Map(subscriptions);
  }

  private parseRelayList(list?: Array<RelayDomain | NostrEvent | ProfilePointer | NProfile | undefined | null>): Array<RelayDomain> {
    let parsed = new Array<RelayDomain>;

    if (!list?.length) {
      return [];
    }

    list.forEach(stuff => {
      if (!stuff) {
        return;
      } else if (typeof stuff === 'string') {
        if (this.nostrGuard.isNProfile(stuff)) {
          //  FIXME: incluir decode que traga os relays já validados com o formato relayString
          const { data: { relays } } = nip19.decode(stuff);
          (relays || []).forEach(relay => {
            if (this.nostrGuard.isRelayString(relay)) {
              parsed.push(relay);
            }
          })  
        } else {
          parsed.push(stuff);
        }
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
        (stuff.relays || []).forEach(r => {
          if (this.nostrGuard.isRelayString(r)) {
            parsed.push(r);
          }
        });
      }
    });

    return parsed;
  }
}
