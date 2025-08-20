import { Inject, Injectable } from '@angular/core';
import { nip19, kinds as NostrEventKind } from 'nostr-tools';
import { NProfile, ProfilePointer } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { RELAY_ROUTER_TOKEN } from '../injection-token/relay-router.token';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { PoolRequestOptions } from './pool-request.options';
import { PoolRouterOptions } from './pool-router.options';
import { RelayLocalConfigService } from './relay-local-config.service';
import { RouterMatcher } from './router-matcher.interface';

/**
 * TODO: incluir mecânica para remover relays que estiverem na lista de bloqueio do usuário
 */
@Injectable()
export class RelayRouterService implements PoolRouterOptions {

  constructor(
    private nostrGuard: NostrGuard,
    private relayConverter: RelayConverter,
    private relayConfigService: RelayLocalConfigService,
    @Inject(RELAY_ROUTER_TOKEN) private routerMatcher: RouterMatcher
  ) { }

  //  TODO: deve-se ler primeiro do `include` (relay hint) e depois deve-se verificar se os eventos
  //  retornados atingiram o limit, se sim, então encerra-se, se não, deve se consultar o resto dos
  //  relays da pool e tratar deduplicação
  //  TODO: https://github.com/soapbox-pub/nostrify/issues/2 
  async eventRouter(event: NostrEvent, opts?: PoolRequestOptions): Promise<Array<RelayDomainString>> {
    if (opts?.useOnly) {
      const usingOnly = this.parseRelayList(opts?.useOnly);
      if (usingOnly.length) {
        return usingOnly;
      }
    }

    const include = this.parseRelayList(opts?.include);
    const router = this.routerMatcher.eventRouter.find(matcher => (matcher.matcher && matcher.matcher(event) || !matcher.matcher) && matcher.router);
    let relays: Array<RelayDomainString> = [];
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

  async reqRouter(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<ReadonlyMap<RelayDomainString, NostrFilter[]>> {
    let relays = new Array<RelayDomainString>();
    if (opts?.useOnly) {
      relays = this.parseRelayList(opts?.useOnly);
    } else {
      const record = await this.relayConfigService.getCurrentUserRelays();
      if (record && record.general) {
        const general = record.general;
        relays = Object.keys(general).filter((url): url is RelayDomainString => {
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

    const subscriptions: Array<[RelayDomainString, NostrFilter[]]> = relays.map(relay => {
      return [ relay, filters ];
    });
  
    return new Map(subscriptions);
  }

  private parseRelayList(list?: Array<RelayDomainString | NostrEvent | ProfilePointer | NProfile | undefined | null>): Array<RelayDomainString> {
    let parsed = new Array<RelayDomainString>;

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
