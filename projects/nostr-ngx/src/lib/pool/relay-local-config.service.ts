import { Inject, Injectable } from '@angular/core';
import { NCache } from '@nostrify/nostrify';
import { kinds } from 'nostr-tools';
import { RelayRecord } from 'nostr-tools/relay';
import { normalizeURL } from 'nostr-tools/utils';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { MAIN_NCACHE_TOKEN } from '../injection-token/main-ncache.token';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { ProfileSessionStorage } from '../configs/profile-session.storage';

// this service is used by pool, so it should never import the pool.
/**
 * find user relay config using in memory and cached info
 */
@Injectable({
  providedIn: 'root'
})
export class RelayLocalConfigService {

  //  FIXME: include correct kind when nostr-tools implements nip17.ts
  readonly kindDirectMessageRelayList = 10050;

  constructor(
    private guard: NostrGuard,
    private relayConverter: RelayConverter,
    private configsLocal: AccountsLocalStorage,
    private configSession: ProfileSessionStorage,
    @Inject(MAIN_NCACHE_TOKEN) private ncache: NCache
  ) { }

  /**
   * Override application default relays for unauthenticated
   */
  setLocalRelays(relays: RelayRecord): void {
    this.configsLocal.patch({ commonRelays: relays });
  }

  // FIXME: solve complexity, divide into more private methods
  /**
   * Return relays according to user-customized settings
   */
  // eslint-disable-next-line complexity
  async getCurrentUserRelays(): Promise<NostrUserRelays | null> {
    const session = this.configSession.read(),
      local = this.configsLocal.read(),
      signer = local.signer;
    let config: NostrUserRelays | null = null,
      extensionRelays: RelayRecord | null = null;

    const userRelays = session.account?.relays;
    const pubkey = session.account?.pubkey;

    if (userRelays) {
      return Promise.resolve(userRelays);
    }

    if (signer === 'extension') {
      extensionRelays = await this.getRelaysFromExtensionSigner();
    }

    if (pubkey) {
      config = await this.getUserRelays(pubkey);
    }

    config = this.mergeUserRelayConfigToExtensionRelays(config, extensionRelays);
    return Promise.resolve(config);
  }

  async getCurrentUserOutboxRelays(): Promise<Array<WebSocket['url']>> {
    const relays = await this.getCurrentUserRelays();
    const outbox = this.relayConverter.extractOutboxRelays(relays);

    return Promise.resolve(outbox);
  }

  async getCurrentUserInboxRelays(): Promise<Array<WebSocket['url']>> {
    const relays = await this.getCurrentUserRelays();
    const inbox = this.relayConverter.extractInboxRelays(relays);

    return Promise.resolve(inbox);
  }

  async getUserRelays(pubkey: string): Promise<NostrUserRelays | null> {
    const [relayListEvent] = await this.ncache.query([
      {
        kinds: [kinds.RelayList],
        authors: [pubkey],
        limit: 1
      }
    ]).catch(() => Promise.resolve([null]));

    if (this.guard.isKind(relayListEvent, kinds.RelayList)) {
      const relayList = this.relayConverter.convertRelayListEventToRelayRecord(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve(null);
  }

  async getUserOutboxRelays(pubkey: string): Promise<Array<WebSocket['url']>> {
    const relays = await this.getUserRelays(pubkey);
    const outbox = this.relayConverter.extractOutboxRelays(relays);

    return Promise.resolve(outbox);
  }

  async getUserInboxRelays(pubkey: string): Promise<Array<WebSocket['url']>> {
    const relays = await this.getUserRelays(pubkey);
    const inbox = this.relayConverter.extractInboxRelays(relays);

    return Promise.resolve(inbox);
  }

  mergeUserRelayConfigToExtensionRelays(config: NostrUserRelays | null, extensionRelays: RelayRecord | null): NostrUserRelays {
    config = config || {};
    if (!extensionRelays) {
      return config;
    }

    const generalConfig = config.general;
    if (!generalConfig) {
      config.general = extensionRelays;
      return config;
    }

    Object.keys(extensionRelays).forEach(relay => {
      relay = normalizeURL(relay)
      if (generalConfig[relay]) {
        if (generalConfig[relay].write || extensionRelays[relay].write) {
          generalConfig[relay].write = true;
        } else {
          generalConfig[relay].write = false;
        }

        if (generalConfig[relay].read || extensionRelays[relay].read) {
          generalConfig[relay].read = true;
        } else {
          generalConfig[relay].read = false;
        }

      } else {
        generalConfig[relay] = extensionRelays[relay];
      }
    });

    config.general = generalConfig;
    return config;
  }

  getRelaysFromExtensionSigner(): Promise<RelayRecord | null> {
    //  accessing like this avoid circular dependency with NostrSigner service
    if (window.nostr) {
      return window.nostr.getRelays();
    }

    return Promise.resolve(null);
  }

  async getUserRelayList(pubkey: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']>> {
    const [relayListEvent] = await this.ncache.query([
      {
        kinds: [kind],
        authors: [pubkey],
        limit: 1
      }
    ]).catch(() => Promise.resolve([null]));

    if (this.guard.isKind(relayListEvent, kind)) {
      const relayList = this.relayConverter.convertRelayEventToRelayList(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve([]);
  }
}
