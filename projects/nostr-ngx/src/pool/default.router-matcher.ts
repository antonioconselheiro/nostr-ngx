import { Injectable } from "@angular/core";
import { NostrEvent } from "@nostrify/nostrify";
import { kinds, nip19 } from "nostr-tools";
import { RelayConfigService } from "./relay-config.service";
import { IRouterMatcher } from "./router-matcher.interface";
import { ProfilePointer } from "nostr-tools/nip19";

@Injectable()
export class DefaultRouterMatcher implements IRouterMatcher {

  defaultFallback = [];

  constructor(
    private relayConfigService: RelayConfigService
  ) {}

  eventRouter = [
    {
      match: this.isDirectMessageEvent.bind(this),
      router: this.routesForDirectMessage.bind(this)
    },

    {
      match: this.isRelayListEvent.bind(this),
      router: this.routerToUpdateRelayList.bind(this)
    },

    {
      router: this.defaultRouting.bind(this)
    }
  ];

  async requestRouter(): Promise<Array<WebSocket['url']>> {
    return Promise.resolve(['']);
  }

  /**
   * create a basic filter just for event kind
   */
  private isDirectMessageEvent(event: NostrEvent): boolean {
    return event.kind === kinds.EncryptedDirectMessage;
  }

  private async routesForDirectMessage(event: NostrEvent): Promise<Array<WebSocket['url']>> {
    const relayRecord = await this.relayConfigService.loadRelaysOnlyHavingPubkey(event.pubkey);

    const pointers = this.getPTagsAsProfilePointer(event)
    const queue = pointers.map(pointer => this.relayConfigService.loadRelaysFromProfilePointer(pointer));
    const listOfRelayList = await Promise.all(queue);

    //  TODOING: agora devo pegar os relays 'write' do relayRecord e os relays 'read' do listOfRelayList, eu acho 
  }

  private getPTagsAsProfilePointer(event: NostrEvent): Array<ProfilePointer> {
    return [];
  }

  private isRelayListEvent(event: NostrEvent): boolean {
    return event.kind === kinds.RelayList;
  }

  private routerToUpdateRelayList(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private defaultRouting(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private extractRelaysFromTags(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }
}
