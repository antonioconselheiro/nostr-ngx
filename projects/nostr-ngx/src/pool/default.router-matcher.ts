import { Injectable } from "@angular/core";
import { kinds, NostrEvent } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/nip19";
import { RelayRecord } from "nostr-tools/relay";
import { RelayConfigService } from "./relay-config.service";
import { RouterMatcher } from "./router-matcher.interface";
import { RelayConverter } from "../nostr/relay.converter";

@Injectable()
export class DefaultRouterMatcher implements RouterMatcher {

  defaultDiscovery = [ 'wss://purplepag.es' ];

  defaultFallback = [ 'wss://nos.lol' ];

  constructor(
    private relayConverter: RelayConverter
    private relayConfigService: RelayConfigService
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

  async requestRouter(): Promise<Array<WebSocket['url']>> {
    return Promise.resolve(['']);
  }

  private isDirectMessageEvent(event: NostrEvent): boolean {
    //  FIXME: include correct kind when nostr-tools implements nip17.ts
    const kindPrivateDirectMessage = 14;
    return event.kind === kinds.EncryptedDirectMessage || event.kind === kindPrivateDirectMessage;
  }

  private async routesToDirectMessage(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    const senderDMRelays = await this.relayConfigService.loadDirectMessageRelaysOnlyHavingPubkey(event.pubkey);
    const pointers = this.getPTagsAsProfilePointer(event)
    const fellows = pointers.map(pointer => this.relayConfigService.loadDirectMessageRelaysFromProfilePointer(pointer));
    const fellowDMRelays = await Promise.all(fellows);
    const list = new Array<WebSocket['url'] | null>()
      .concat(senderDMRelays || [])
      .concat(fellowDMRelays.flat(2))
      .filter((r): r is WebSocket['url'] => !!r);

    return Promise.resolve(list);
  }

  /**
   * is react, reply, follow, unfollow or some event
   * where author interacts with another user
   */
  private isInteractionEvent(event: NostrEvent): event is NostrEvent {
    //  TODO: encontrar tag p? mapear por kind?
  }

  /**
   * Relays outbox do usuário solicitante e relays inbox do usuário destino
   */
  private async routesToUserOutboxAndFellowInbox(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    const relayRecord = await this.relayConfigService.loadMainRelaysOnlyHavingPubkey(event.pubkey);
    const senderOutbox = this.extractOutboxRelays(relayRecord);

    const pointers = this.getPTagsAsProfilePointer(event)
    const fellows = pointers.map(pointer => this.relayConfigService.loadMainRelaysFromProfilePointer(pointer));
    const listOfRelayList = await Promise.all(fellows);
    const fellowInbox = this.extractInboxRelays(listOfRelayList);

    return Promise.resolve([
      ...senderOutbox,
      ...fellowInbox
    ]);
  }

  /**
   * get p tag from given event cast into nostr-tools ProfilePointer,
   * FIXME: move it to me reused, maybe should I migrate this to zod/nschema
   */
  private getPTagsAsProfilePointer(event: NostrEvent): Array<ProfilePointer> {
    const pTags = event.tags.filter(([kind]) => kind === 'p') as [ 'p', string, ...string[] ][];
    return pTags.map(([,pubkey, ...relays]) => {
      return {
        pubkey,
        relays
      }
    });
  }

  private extractOutboxRelays(relayRecord: RelayRecord | null | Array<RelayRecord | null>): Array<WebSocket['url']> {
    return this.extractRelaysOfRelayRecord(relayRecord, 'write');
  }

  private extractInboxRelays(relayRecord: RelayRecord | null | Array<RelayRecord | null>): Array<WebSocket['url']> {
    return this.extractRelaysOfRelayRecord(relayRecord, 'read');
  }

  private extractRelaysOfRelayRecord(
    relayRecord: RelayRecord | null | Array<RelayRecord | null>,
    relayType: 'read' | 'write'
  ): Array<WebSocket['url']> {
    if (relayRecord instanceof Array) {
      return relayRecord.map(record => this.extractOutboxRelays(record)).flat(2);
    } else if (relayRecord) {
      return Object
        .keys(relayRecord)
        .filter(relay => relayRecord[relay][relayType]);
    }

    return [];
  }

  private isRelayListEvent(event: NostrEvent): event is NostrEvent & { kind: typeof kinds.RelayList } {
    return event.kind === kinds.RelayList;
  }

  /**
   * Update old write relays and new write relays
   */
  private async routerToUpdateMainRelayList(event: NostrEvent & { kind: typeof kinds.RelayList }): Promise<Array<WebSocket['url']>> {
    //  Updating old relay list helps users listen to these knows you don't use this relay anymore.
    //  It will load the last published relay list from ncache or from indexeddb, if user is editing
    //  relay list the event will be surely loaded
    const oldRelayRecord = await this.relayConfigService.loadMainRelaysOnlyHavingPubkey(event.pubkey);
    const newRelayRecord = this.relayConverter.convertRelayListEventToRelayRecord(event);
    const relayList = this.extractRelaysOfRelayRecord([ newRelayRecord, oldRelayRecord ], 'write');

    return Promise.resolve(relayList);
  }

  private isDirectMessageRelayListEvent(event: NostrEvent): event is NostrEvent & { kind: 10050 } {
    return event.kind === this.relayConfigService.kindDirectMessageRelayList;
  }

  private routerToUpdateDirectMessageRelayList(event: NostrEvent & { kind: 10050 }): Promise<Array<WebSocket['url']>> {
    const oldRelayRecord = await this.relayConfigService.loadDirectMessageRelaysOnlyHavingPubkey(event.pubkey);
    const newRelayRecord = this.relayConverter.convertDirectMessageRelayEventToRelayList(event);
    const relayList = [...(oldRelayRecord || []), ...newRelayRecord];

    return Promise.resolve(relayList);
  }

  private defaultRouting(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    event;
    return Promise.resolve([]);
  }

  private extractRelaysFromTags(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    event;
    return Promise.resolve([]);
  }
}
