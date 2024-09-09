import { Injectable } from "@angular/core";
import { NostrEvent } from "@nostrify/nostrify";
import { kinds } from "nostr-tools";
import { IdbNStore } from "../idb-cache/idb.nstore";
import { RelayConfigService } from "./relay-config.service";
import { IRouterMatcher } from "./router-matcher.interface";

@Injectable()
export class DefaultRouterMatcher implements IRouterMatcher {
  fallback = [];

  constructor(
    private relayConfigService: RelayConfigService,
    private idb: IdbNStore
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
      match: this.isAddressedEvent.bind(this),
      router: this.routerForAddressed.bind(this)
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

  private routesForDirectMessage(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private isRelayListEvent(event: NostrEvent): boolean {
    return event.kind === kinds.RelayList;
  }

  private routerToUpdateRelayList(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private isAddressedEvent(event: NostrEvent): boolean {
    //  tag a
  }

  private routerForAddressed(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private defaultRouting(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }
}
