import { Injectable } from "@angular/core";
import { NostrEvent } from "@nostrify/nostrify";
import { kinds } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/nip19";
import { RelayRecord } from "nostr-tools/relay";
import { RelayConfigService } from "./relay-config.service";
import { IRouterMatcher } from "./router-matcher.interface";

@Injectable()
export class DefaultRouterMatcher implements IRouterMatcher {

  defaultFallback = [];

  constructor(
    private relayConfigService: RelayConfigService
  ) {}

  eventRouter = [
    {
      match: this.isDirectMessageEvent.bind(this),
      router: this.routesToDirectMessage.bind(this)
    },
    {
      match: this.isRelayListEvent.bind(this),
      router: this.routerToUpdateRelayList.bind(this)
    },
    {
      match: this.isInteractionEvent.bind(this),
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
    const fellows = pointers.map(pointer => this.relayConfigService.loadMainRelaysFromProfilePointer(pointer));
    const fellowDMRelays = await Promise.all(fellows);

    return Promise.resolve([
      ...senderDMRelays,
      ...fellowDMRelays
    ]);
  }

  /**
   * is react, reply, follow, unfollow or some event
   * where author interacts with another user
   */
  private isInteractionEvent(event: NostrEvent): boolean {
    //  TODO: encontrar tag p? mapear por kind?
  }

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
    return this.extractRelaysOfRelayList(relayRecord, 'write');
  }

  private extractInboxRelays(relayRecord: RelayRecord | null | Array<RelayRecord | null>): Array<WebSocket['url']> {
    return this.extractRelaysOfRelayList(relayRecord, 'read');
  }

  private extractRelaysOfRelayList(relayRecord: RelayRecord | null | Array<RelayRecord | null>, relayType: 'read' | 'write'): Array<WebSocket['url']> {
    if (relayRecord instanceof Array) {
      return relayRecord.map(record => this.extractOutboxRelays(record)).flat(2);
    } else if (relayRecord) {
      return Object
        .keys(relayRecord)
        .filter(relay => relayRecord[relay][relayType]);
    }

    return [];
  }

  private isRelayListEvent(event: NostrEvent): boolean {
    //  FIXME: include correct kind when nostr-tools implements nip17.ts
    const kindDirectMessageRelayList = 10050;
    return event.kind === kinds.RelayList || event.kind === kindDirectMessageRelayList;
  }

  private routerToUpdateRelayList(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private defaultRouting(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private extractRelaysFromTags(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }
}
