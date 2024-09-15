import { Injectable } from '@angular/core';
import { kinds, nip19 } from 'nostr-tools';
import { queryProfile } from 'nostr-tools/nip05';
import { RelayRecord } from 'nostr-tools/relay';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';
import { NostrLocalConfig } from '../configs/nostr-local-config.interface';
import { Nip05 } from '../domain/nip05.type';
import { NProfile } from '../domain/nprofile.type';
import { NPub } from '../domain/npub.type';
import { NostrConverter } from '../nostr/nostr.converter';
import { NostrGuard } from '../nostr/nostr.guard';
import { RelayConverter } from '../nostr/relay.converter';
import { NostrPool } from './nostr.pool';
import { ProfilePointer } from 'nostr-tools/nip19';

/**
 * load each kind of relay config
 */
@Injectable({
  providedIn: 'root'
})
export class RelayConfigService {

  readonly hexadecimalRegex = /^[a-f\d]+$/;

  //  FIXME: include correct kind when nostr-tools implements nip17.ts
  readonly kindsBlockedRelayList = 10006;
  readonly kindsSearchRelayList = 10007;
  readonly kindDirectMessageRelayList = 10050;

  constructor(
    private guard: NostrGuard,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter,
    private configs: ConfigsLocalStorage,
    private pool: NostrPool
  ) { }

  /**
   * Override application default relays for unauthenticated
   * accounts and for accounts without any relay configured
   *
   * @param relays
   * @param npub 
   */
  setLocalRelays(relays: RelayRecord, npub?: NPub, directMessagesRelays?: Array<WebSocket['url']>): void {
    const local = this.configs.read();
    
    if (npub) {
      const { data: pubkey } = nip19.decode(npub);
      if (!local.accounts) {
        local.accounts = {};
      }

      if (local.accounts[pubkey]) {
        if (local.accounts[pubkey].relays) {
          local.accounts[pubkey].relays.general = relays;
        } else {
          local.accounts[pubkey].relays = { general: relays };
        }
      } else {
        local.accounts[pubkey] = { relays: { general: relays } };
      }

      if (directMessagesRelays) {
        local.accounts[pubkey].relays.directMessage = directMessagesRelays
      }
    } else {
      local.commonRelays = relays;
    }
  }

  /**
   * Return relays according to user-customized settings
   */
  async getCurrentUserRelays(): Promise<RelayRecord | null> {
    const local = this.configs.read();
    const relayFrom = local.relayFrom;
    let relayRecord: RelayRecord | null = null;

    if (relayFrom === 'signer') {
      relayRecord = await this.getRelaysFromSigner();
    } else if (relayFrom === 'localStorage') {
      relayRecord = await this.getMainRelaysFromStorage(local);
    } else if (relayFrom === 'public' && local.currentPubkey) {
      relayRecord = await this.getUserPublicMainRelays(local.currentPubkey);
    }

    console.info('local configs', local);
    console.info('result relays', relayRecord);
    return relayRecord;
  }

  private getRelaysFromSigner(): Promise<RelayRecord> {
    if (window.nostr) {
      return window.nostr.getRelays();
    }

    return Promise.resolve({});
  }

  private getMainRelaysFromStorage(local: NostrLocalConfig): Promise<RelayRecord> {
    const pubkey = local.currentPubkey;
    if (pubkey) {
      return Promise.resolve(local.accounts && local.accounts[pubkey].relays || {})
    }

    return Promise.resolve(local.commonRelays || {});
  }

  async getUserPublicMainRelays(nip5: Nip05): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(npub: NPub): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(nprofile: NProfile): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(pubkey: string): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(userPublicAddress: string): Promise<RelayRecord | null> {
    if (this.guard.isNip05(userPublicAddress)) {
      return this.loadMainRelaysFromNIP5(userPublicAddress);
    } else if (this.guard.isNPub(userPublicAddress)) {
      return this.loadMainRelaysOnlyHavingNpub(userPublicAddress);
    } else if (this.guard.isNProfile(userPublicAddress)) {
      return this.loadMainRelaysFromNprofile(userPublicAddress);
    } else if (this.hexadecimalRegex.test(userPublicAddress)) {
      return this.loadMainRelaysOnlyHavingPubkey(userPublicAddress);
    }

    return Promise.resolve(null);
  }

  async loadMainRelaysFromProfilePointer(pointer: ProfilePointer): Promise<RelayRecord | null> {
    if (pointer.relays?.length) {
      const { pubkey } = pointer;
      const [relayListEvent] = await this.pool.query([
        {
          kinds: [ kinds.RelayList ],
          authors: [ pubkey ],
          limit: 1
        }
      ], {
        useOnly: pointer.relays
      }).catch(() => Promise.resolve([null]));

      if (this.guard.isKind(relayListEvent, kinds.RelayList)) {
        const record = this.relayConverter.convertRelayListEventToRelayRecord(relayListEvent);
        return Promise.resolve(record);
      }

      return this.loadMainRelaysOnlyHavingPubkey(pubkey);
    }

    return Promise.resolve(null);
  }

  async loadMainRelaysFromNprofile(nprofile: NProfile): Promise<RelayRecord | null> {
    return this.loadMainRelaysFromProfilePointer(nip19.decode(nprofile).data);
  }

  async loadMainRelaysFromNIP5(nip5: Nip05): Promise<RelayRecord | null> {
    const pointer = await queryProfile(nip5);

    if (pointer) {
      return this.loadMainRelaysFromProfilePointer(pointer);
    }

    return Promise.resolve(null);
  }

  async loadMainRelaysOnlyHavingNpub(npub: NPub): Promise<RelayRecord | null> {
    const pubkey = this.nostrConverter.castNostrPublicToPubkey(npub);
    return this.loadMainRelaysOnlyHavingPubkey(pubkey);
  }

  async loadMainRelaysOnlyHavingPubkey(pubkey: string): Promise<RelayRecord | null> {
    const [relayListEvent] = await this.pool.query([
      {
        kinds: [ kinds.RelayList ],
        authors: [ pubkey ],
        limit: 1
      }
    ], {
      /**
       * TODO: preciso centralizar isso como configuração
       */
      include: [ 'wss://purplepag.es' ]
    }).catch(() => Promise.resolve([null]));

    if (this.guard.isKind(relayListEvent, kinds.RelayList)) {
      const relayList = this.relayConverter.convertRelayListEventToRelayRecord(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve(null);
  }

  //  do u like overloads? mwhaHAah

  /**
   * @returns user list of blocked relays, using NIP5.
   */
  getUserRelayList(nip5: Nip05, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using nprofile.
   */
  getUserRelayList(nprofile: NProfile, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for search, using NIP5.
   */
  getUserRelayList(nip5: Nip05, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using nprofile.
   */
  getUserRelayList(nprofile: NProfile, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10007): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for direct message, using NIP5.
   */
  getUserRelayList(nip5: Nip05, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using nprofile.
   */
  getUserRelayList(nprofile: NProfile, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10050): Promise<Array<WebSocket['url']> | null>;

  /**
   * @param userPublicAddress nip5, npub, nprofile or pubkey
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  getUserRelayList(userPublicAddress: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async getUserRelayList(userPublicAddress: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const HEXADECIMAL_REGEX = /^[a-f\d]+$/;
    if (this.guard.isNip05(userPublicAddress)) {
      return this.loadRelayListFromNIP5(userPublicAddress, kind);
    } else if (this.guard.isNPub(userPublicAddress)) {
      return this.loadRelayListOnlyHavingNpub(userPublicAddress, kind);
    } else if (this.guard.isNProfile(userPublicAddress)) {
      return this.loadRelayListFromNprofile(userPublicAddress, kind);
    } else if (HEXADECIMAL_REGEX.test(userPublicAddress)) {
      return this.loadRelayListOnlyHavingPubkey(userPublicAddress, kind);
    }

    return Promise.resolve(null);
  }

  /**
   * @returns user list of blocked relays, using ProfilePointer.
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using ProfilePointer.
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using ProfilePointer.
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param pointer ProfilePointer
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    if (pointer.relays?.length) {
      const { pubkey } = pointer;
      const [directMessageRelayListEvent] = await this.pool.query([
        {
          kinds: [ this.kindDirectMessageRelayList ],
          authors: [ pubkey ],
          limit: 1
        }
      ], {
        useOnly: pointer.relays
      }).catch(() => Promise.resolve([null]));

      if (this.guard.isKind(directMessageRelayListEvent, this.kindDirectMessageRelayList)) {
        const relayList = this.relayConverter.convertRelayEventToRelayList(directMessageRelayListEvent);
        return Promise.resolve(relayList);
      }

      return this.loadRelayListOnlyHavingPubkey(pubkey, kind);
    }

    return Promise.resolve(null);
  }

  /**
   * @returns user list of blocked relays, using using nprofile.
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using using nprofile.
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using using nprofile.
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param nprofile using nprofile
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListFromNprofile(nprofile: NProfile, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    return this.loadRelayListFromProfilePointer(nip19.decode(nprofile).data, kind);
  }

  /**
   * @returns user list of blocked relays, using NIP5.
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using NIP5.
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using NIP5.
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param nip5 using NIP5
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListFromNIP5(nip5: Nip05, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const pointer = await queryProfile(nip5);

    if (pointer) {
      return this.loadRelayListFromProfilePointer(pointer, kind);
    }

    return Promise.resolve(null);
  }

  /**
   * @returns user list of blocked relays, using npub.
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using npub.
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using npub.
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param nip5 using npub
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListOnlyHavingNpub(npub: NPub, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const pubkey = this.nostrConverter.castNostrPublicToPubkey(npub);
    return this.loadRelayListOnlyHavingPubkey(pubkey, kind);
  }

  /**
   * @returns user list of blocked relays, using hexadecimal pubkey.
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using hexadecimal pubkey.
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using hexadecimal pubkey.
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param pubkey using pubkey hexadecimal
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const [relayListEvent] = await this.pool.query([
      {
        kinds: [ kind ],
        authors: [ pubkey ],
        limit: 1
      }
    ], {
      /**
       * TODO: preciso centralizar isso como configuração
       */
      include: [ 'wss://purplepag.es' ]
    }).catch(() => Promise.resolve([null]));

    if (this.guard.isKind(relayListEvent, kind)) {
      const relayList = this.relayConverter.convertRelayEventToRelayList(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve(null);
  }
}
