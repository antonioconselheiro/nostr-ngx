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
      match: this.matchDirectMessage.bind(this),
      router: this.routesForDirectMessage.bind(this)
    },

    {
      match: this.matchAddressed.bind(this),
      router: this.routerForAddressed.bind(this)
    },

    {
      router: this.defaultRouting.bind(this)
    }
  ];

  async requestRouter(): Promise<Array<string>> {
    return Promise.resolve(['']);
  }

  /**
   * create a basic filter just for event kind
   */
  private matchDirectMessage(event: NostrEvent): boolean {
    return event.kind === kinds.EncryptedDirectMessage;
  }

  private routesForDirectMessage(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private matchAddressed(event: NostrEvent): boolean {

  }

  private routerForAddressed(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }

  private defaultRouting(event: NostrEvent): Promise<Array<WebSocket['url']>> {

  }
}
