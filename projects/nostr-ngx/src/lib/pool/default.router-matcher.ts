import { Inject, Injectable } from "@angular/core";
import { kinds } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/nip19";
import { RelayRecord } from "nostr-tools/relay";
import { NostrConfig } from "../configs/nostr-config.interface";
import { NOSTR_CONFIG_TOKEN } from "../injection-token/nostr-config.token";
import { NostrGuard } from "../nostr-utils/nostr.guard";
import { RelayConverter } from "../nostr-utils/relay.converter";
import { RelayLocalConfigService } from "./relay-local-config.service";
import { RouterMatcher } from "./router-matcher.interface";
import { NostrEvent } from "../domain/nostr-event.interface";
import { DirectMessageRelaysList, RelayList } from "nostr-tools/kinds";

/**
 * TODO: incluir roteamento para addressed event
 * TODO: incluir roteamento para relays de pesquisa (10007)
 * TODO: no-mvp: incluir roteamento para wiki
 */

/**
 * Default Router Matcher is the default implementation of RouterMatcher.
 * Why you need that? https://mikedilger.com/gossip-model/
 */
@Injectable()
export class DefaultRouterMatcher implements RouterMatcher {

  constructor(
    private guard: NostrGuard,
    private relayConverter: RelayConverter,
    private relayConfigService: RelayLocalConfigService,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  eventRouter = [
    {
      matcher: this.isDirectMessageEvent.bind(this),
      router: this.routesToDirectMessage.bind(this)
    },

    {
      matcher: this.isRelayListEvent.bind(this),
      router: this.routerToUpdateMainRelayList.bind(this)
    },
    {
      matcher: this.isDirectMessageRelayListEvent.bind(this),
      router: this.routerToUpdateDirectMessageRelayList.bind(this)
    },
    {
      matcher: this.isInteractionEvent.bind(this),
      router: this.routesToUserOutboxAndFellowInbox.bind(this)
    },
    {
      router: this.defaultRouting.bind(this)
    }
  ];

  //
  // FIXME: eu não sei existe um tipo especifico de relay para search e outro
  // para discovery ou se os dois são o mesmo tipo ou então se eu devo agrupar
  // aqui tanto os melhores relays para encontrar usuários assim como os melhores
  // relays para encontrar eventos. Enfim, preciso entender isso para saber se
  // precisarei fazer modificações. 
  ///
  defaultSearch(): Array<WebSocket['url']> {
    return this.nostrConfig.searchFallback;
  }

  defaultFallback(): RelayRecord {
    return this.nostrConfig.defaultFallback;
  }

  async requestRouter(): Promise<Array<WebSocket['url']>> {
    const mainRelayRecord = await this.relayConfigService.getCurrentUserRelays();
    return this.relayConverter.extractInboxRelays(mainRelayRecord);
  }

  private isDirectMessageEvent(event: NostrEvent): boolean {
    return event.kind === kinds.EncryptedDirectMessage || event.kind === kinds.PrivateDirectMessage;
  }

  private async routesToDirectMessage(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    const senderDMRelays = await this.relayConfigService.getUserRelayList(event.pubkey, DirectMessageRelaysList);
    const pointers = this.getPTagsAsProfilePointer(event)
    const fellows = pointers.map(pointer => this.relayConfigService.getUserRelayList(pointer.pubkey, DirectMessageRelaysList));
    const fellowRelaysFromPointers = pointers.map(pointer => pointer.relays);
    const fellowDMRelays = await Promise.all(fellows);
    const list = new Array<WebSocket['url'] | null>()
      .concat(senderDMRelays || [])
      .concat(fellowDMRelays.flat(2))
      .concat(fellowRelaysFromPointers.flat(2).filter((r): r is string => !!r))
      .filter((r): r is WebSocket['url'] => !!r);

    console.log('routing direct message event, relays: ', list);
    return Promise.resolve(list);
  }

  /**
   * is react, reply, follow, unfollow or some event
   * where author interacts with another user
   */
  private isInteractionEvent(event: NostrEvent): event is NostrEvent {
    const find = event.tags.find(([type]) => type === 'p');

    return find && find.length && true || false;
  }

  /**
   * Relays outbox do usuário solicitante e relays inbox do usuário destino.
   * FIXME: reler sobre essa abordagem, pode ser que eu não esteja fazendo o roteamento correto para interação
   */
  private async routesToUserOutboxAndFellowInbox(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    const relayRecord = await this.relayConfigService.getUserRelays(event.pubkey);
    const senderOutbox = this.relayConverter.extractOutboxRelays(relayRecord);

    const pointers = this.getPTagsAsProfilePointer(event);
    const fellows = pointers.map(pointer => this.relayConfigService.getUserRelays(pointer.pubkey));
    const fellowRelaysFromPointers = pointers.map(pointer => pointer.relays);

    const listOfRelayList = await Promise.all(fellows);
    const fellowInbox = this.relayConverter.extractInboxRelays(listOfRelayList);
    const relayList = [
      //  don't remove too much relays from main user because client must obey his configs
      ...senderOutbox,
      //  too much relays is bad
      ...fellowInbox.splice(0, 3),
      //  including all relays included as pointers
      ...fellowRelaysFromPointers.flat(2).filter((r): r is string => !!r)
    ];

    console.log('routing interaction to user outbox and fellows inbox, relays: ', relayList);

    return Promise.resolve(relayList);
  }

  /**
   * get p tag from given event cast into nostr-tools ProfilePointer,
   * FIXME: move it to me reused, maybe should I migrate this to zod/nschema
   */
  private getPTagsAsProfilePointer(event: NostrEvent): Array<ProfilePointer> {
    const pTags = event.tags.filter(([kind]) => kind === 'p') as ['p', string, ...string[]][];
    return pTags.map(([, pubkey, ...relays]) => {
      return {
        pubkey,
        relays
      }
    });
  }

  private isRelayListEvent(event: NostrEvent): event is NostrEvent<RelayList> {
    return event.kind === kinds.RelayList;
  }

  /**
   * Update old write relays and new write relays
   */
  private async routerToUpdateMainRelayList(event: NostrEvent<RelayList>): Promise<Array<WebSocket['url']>> {
    //  Updating old relay list helps users listen to these knows you don't use this relay anymore.
    //  It will load the last published relay list from ncache or from indexeddb, if user is editing
    //  relay list the event will be surely loaded
    const oldRelayRecord = await this.relayConfigService.getUserRelays(event.pubkey);
    const newRelayRecord = this.relayConverter.convertRelayListEventToRelayRecord(event);
    const relayList = this.relayConverter.extractRelaysOfRelayRecord([newRelayRecord, oldRelayRecord], 'write');

    console.log('routing relay list update, sending to relays:', relayList);
    return Promise.resolve(relayList);
  }

  private isDirectMessageRelayListEvent(event: NostrEvent): event is NostrEvent<DirectMessageRelaysList> {
    return this.guard.isKind(event, DirectMessageRelaysList);
  }

  /**
   * this is not for sending private message, is for update relay list for sending private message
   */
  private async routerToUpdateDirectMessageRelayList(event: NostrEvent<DirectMessageRelaysList>): Promise<Array<WebSocket['url']>> {
    //  load author write relays
    const authorRelayRecord = await this.relayConfigService.getUserRelays(event.pubkey);
    const authorWriteRelays = this.relayConverter.extractRelaysOfRelayRecord(authorRelayRecord, 'write');

    //  load old direct message author list
    const oldRelayDMList = await this.relayConfigService.getUserRelayList(
      event.pubkey, DirectMessageRelaysList
    );

    //  get relays from new direct message list
    const newRelayDMList = this.relayConverter.convertRelayEventToRelayList(event);

    //  join these three lists
    const relayList = [...(oldRelayDMList || []), ...newRelayDMList, ...authorWriteRelays];
    console.log('routing to update relay list for direct message, sending updates to relays:', relayList);

    return Promise.resolve(relayList);
  }

  private async defaultRouting(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    const authorRelayConfig = await this.relayConfigService.getUserRelays(event.pubkey);
    const authorWriteRelays = this.relayConverter.extractRelaysOfRelayRecord(authorRelayConfig, 'write');

    console.log('routing to default, sending updates to relays:', authorWriteRelays);
    return Promise.resolve(authorWriteRelays);
  }
}
