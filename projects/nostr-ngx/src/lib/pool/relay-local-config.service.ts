import { Inject, Injectable } from '@angular/core';
import { NCache } from '@nostrify/nostrify';
import { kinds, NostrEvent } from 'nostr-tools';
import { RelayRecord } from 'nostr-tools/relay';
import { normalizeURL } from 'nostr-tools/utils';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { MAIN_NCACHE_TOKEN } from '../injection-token/main-ncache.token';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { ProfileSessionStorage } from '../configs/profile-session.storage';
import { NPub } from '../domain/npub.type';
import { NostrConverter } from '../nostr-utils/nostr.converter';

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
    private nostrConverter: NostrConverter,
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
    const session = this.configSession.read();
    const { signer } = this.configsLocal.read();
    const account = session.account;
    let userRelays: NostrUserRelays | null = null,
      extensionRelays: RelayRecord | null = null;

    if (account) {
      const relays = account.relays;
      if (relays && Object.keys(relays.general || {}).length) {
        userRelays = relays;
      } else {
        const events = await this.findProfileConfig(account.pubkey);
        const record = this.relayConverter.convertEventsToRelayConfig(events);
        const relaysConfig = record[account.pubkey];
        if (relaysConfig) {
          userRelays = relaysConfig;
          account.relays = userRelays
          this.configSession.patch({ account });
        }
      }
    }

    if (signer === 'extension') {
      extensionRelays = await this.getRelaysFromExtensionSigner();
    }

    const config = this.mergeUserRelayConfigToExtensionRelays(userRelays, extensionRelays);
    return Promise.resolve(config);
  }

  private findProfileConfig(pubkey: string): Promise<Array<NostrEvent>> {
    return this.ncache.query([
      {
        kinds: [kinds.Metadata],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [kinds.RelayList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [kinds.SearchRelaysList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [kinds.BlockedRelaysList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [this.kindDirectMessageRelayList],
        authors: [pubkey],
        limit: 1
      }
    ]);
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

  async getUserRelays(pubkey: string): Promise<RelayRecord | null> {
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

  mergeUserRelayConfigToExtensionRelays(
    record: NostrUserRelays | null | undefined,
    extensionRelays: RelayRecord | null
  ): NostrUserRelays | null {
    if (!extensionRelays || !Object.keys(extensionRelays).length) {
      return record || null;
    }

    if (!record) {
      return extensionRelays;
    }

    const general = { ...record.general };
    Object.keys(general).forEach(relay => {
      relay = normalizeURL(relay);
      if (general[relay]) {
        if (general[relay].write || extensionRelays[relay].write) {
          general[relay].write = true;
        } else {
          general[relay].write = false;
        }

        if (general[relay].read || extensionRelays[relay].read) {
          general[relay].read = true;
        } else {
          general[relay].read = false;
        }

      } else {
        general[relay] = extensionRelays[relay];
      }
    });

    return record;
  }

  getRelaysFromExtensionSigner(): Promise<RelayRecord | null> {
    //  accessing like this avoid circular dependency with NostrSigner service
    if (window.nostr) {
      return window.nostr.getRelays();
    }

    return Promise.resolve(null);
  }

  /**
   * @param userPublicAddress nip5, npub, nprofile or pubkey
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  getUserRelayList(userPublicAddress: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10006): Promise<Array<WebSocket['url']> | null>;


  /**
   * @returns user list of blocked relays, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for search, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10007): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for search, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10007): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for direct message, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10050): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for direct message, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  async getUserRelayList(userPublicAddress: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    if (this.guard.isNPub(userPublicAddress)) {
      return this.getRelayListOnlyHavingNpub(userPublicAddress, kind);
    } else if (this.guard.isHexadecimal(userPublicAddress)) {
      return this.getRelayListOnlyHavingPubkey(userPublicAddress, kind);
    }

    return Promise.resolve(null);
  }

  /**
   * @returns user list of blocked relays, using npub.
   */
  getRelayListOnlyHavingNpub(npub: NPub, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using npub.
   */
  getRelayListOnlyHavingNpub(npub: NPub, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using npub.
   */
  getRelayListOnlyHavingNpub(npub: NPub, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param nip5 using npub
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  getRelayListOnlyHavingNpub(npub: NPub, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async getRelayListOnlyHavingNpub(npub: NPub, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const pubkey = this.nostrConverter.casNPubToPubkey(npub);
    return this.getRelayListOnlyHavingPubkey(pubkey, kind);
  }

  /**
 * @returns user list of blocked relays, using hexadecimal pubkey.
 */
  getRelayListOnlyHavingPubkey(pubkey: string, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using hexadecimal pubkey.
   */
  getRelayListOnlyHavingPubkey(pubkey: string, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using hexadecimal pubkey.
   */
  getRelayListOnlyHavingPubkey(pubkey: string, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param pubkey using pubkey hexadecimal
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  getRelayListOnlyHavingPubkey(pubkey: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async getRelayListOnlyHavingPubkey(pubkey: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
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

    return Promise.resolve(null);
  }
}
