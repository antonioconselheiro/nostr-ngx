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
import { MainPool } from './main.pool';
import { ProfilePointer } from 'nostr-tools/nip19';

@Injectable({
  providedIn: 'root'
})
export class RelayConfigService {

  //  FIXME: include correct kind when nostr-tools implements nip17.ts
  readonly kindDirectMessageRelayList = 10050;

  constructor(
    private guard: NostrGuard,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter,
    private configs: ConfigsLocalStorage,
    private pool: MainPool
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
      if (!local.accounts) {
        local.accounts = {};
      }

      if (local.accounts[npub]) {
        if (local.accounts[npub].relays) {
          local.accounts[npub].relays.general = relays;
        } else {
          local.accounts[npub].relays = { general: relays };
        }
      } else {
        local.accounts[npub] = { relays: { general: relays } };
      }

      if (directMessagesRelays) {
        local.accounts[npub].relays.directMessage = directMessagesRelays
      }
    } else {
      local.commonRelays = relays;
    }
  }

  /**
   * Return relays according to user-customized settings
   */
  getCurrentUserRelays(): Promise<RelayRecord | null>;
  getCurrentUserRelays(nip5: Nip05): Promise<RelayRecord | null>;
  getCurrentUserRelays(nostrPublic: NPub): Promise<RelayRecord | null>;
  getCurrentUserRelays(nostrPublic: NPub): Promise<RelayRecord | null>;
  getCurrentUserRelays(userPublicAddress?: string): Promise<RelayRecord | null>;
  async getCurrentUserRelays(userPublicAddress?: string): Promise<RelayRecord | null> {
    const local = this.configs.read();
    const relayFrom = local.relayFrom;
    let relayRecord: RelayRecord | null = null;

    if (relayFrom === 'signer') {
      relayRecord = await this.getRelaysFromSigner();
    } else if (relayFrom === 'localStorage') {
      relayRecord = await this.getMainRelaysFromStorage(local, userPublicAddress);
    } else if (relayFrom === 'public') {
      if (userPublicAddress) {
        relayRecord = await this.getUserPublicMainRelays(userPublicAddress);
      }
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

  private getMainRelaysFromStorage(local: NostrLocalConfig): Promise<RelayRecord>;
  private getMainRelaysFromStorage(local: NostrLocalConfig, nostrPublic: NPub): Promise<RelayRecord>;
  private getMainRelaysFromStorage(local: NostrLocalConfig, userPublicAddress?: string): Promise<RelayRecord>;
  private getMainRelaysFromStorage(local: NostrLocalConfig, userPublicAddress?: string): Promise<RelayRecord> {
    if (!userPublicAddress) {
      return Promise.resolve(local.commonRelays || {});
    } else if (this.guard.isNPub(userPublicAddress)) {
      return Promise.resolve(local.accounts && local.accounts[userPublicAddress].relays || {})
    }

    return Promise.resolve({});
  }

  async getUserPublicMainRelays(nip5: Nip05): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(npub: NPub): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(nprofile: NProfile): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(pubkey: string): Promise<RelayRecord | null>;
  async getUserPublicMainRelays(userPublicAddress: string): Promise<RelayRecord | null> {
    const HEXADECIMAL_REGEX = /^[a-f\d]+$/;
    if (this.guard.isNip05(userPublicAddress)) {
      return this.loadMainRelaysFromNIP5(userPublicAddress);
    } else if (this.guard.isNPub(userPublicAddress)) {
      return this.loadMainRelaysOnlyHavingNpub(userPublicAddress);
    } else if (this.guard.isNProfile(userPublicAddress)) {
      return this.loadMainRelaysFromNprofile(userPublicAddress);
    } else if (HEXADECIMAL_REGEX.test(userPublicAddress)) {
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
          authors: [ pubkey ]
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
        authors: [ pubkey ]
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

  async getUserDirectMessageRelays(nip5: Nip05): Promise<Array<WebSocket['url']> | null>;
  async getUserDirectMessageRelays(npub: NPub): Promise<Array<WebSocket['url']> | null>;
  async getUserDirectMessageRelays(nprofile: NProfile): Promise<Array<WebSocket['url']> | null>;
  async getUserDirectMessageRelays(pubkey: string): Promise<Array<WebSocket['url']> | null>;
  async getUserDirectMessageRelays(userPublicAddress: string): Promise<Array<WebSocket['url']> | null> {
    const HEXADECIMAL_REGEX = /^[a-f\d]+$/;
    if (this.guard.isNip05(userPublicAddress)) {
      return this.loadDirectMessageRelaysFromNIP5(userPublicAddress);
    } else if (this.guard.isNPub(userPublicAddress)) {
      return this.loadDirectMessageRelaysOnlyHavingNpub(userPublicAddress);
    } else if (this.guard.isNProfile(userPublicAddress)) {
      return this.loadDirectMessageRelaysFromNprofile(userPublicAddress);
    } else if (HEXADECIMAL_REGEX.test(userPublicAddress)) {
      return this.loadDirectMessageRelaysOnlyHavingPubkey(userPublicAddress);
    }

    return Promise.resolve(null);
  }

  async loadDirectMessageRelaysFromProfilePointer(pointer: ProfilePointer): Promise<Array<WebSocket['url']> | null> {
    if (pointer.relays?.length) {
      const { pubkey } = pointer;
      const [directMessageRelayListEvent] = await this.pool.query([
        {
          kinds: [ this.kindDirectMessageRelayList ],
          authors: [ pubkey ]
        }
      ], {
        useOnly: pointer.relays
      }).catch(() => Promise.resolve([null]));

      if (this.guard.isKind(directMessageRelayListEvent, this.kindDirectMessageRelayList)) {
        const relayList = this.relayConverter.convertDirectMessageRelayEventToRelayList(directMessageRelayListEvent);
        return Promise.resolve(relayList);
      }

      return this.loadDirectMessageRelaysOnlyHavingPubkey(pubkey);
    }

    return Promise.resolve(null);
  }

  async loadDirectMessageRelaysFromNprofile(nprofile: NProfile): Promise<Array<WebSocket['url']> | null> {
    return Promise.resolve([]);
  }

  async loadDirectMessageRelaysFromNIP5(nip5: Nip05): Promise<Array<WebSocket['url']> | null> {
    return Promise.resolve([]);
  }

  async loadDirectMessageRelaysOnlyHavingNpub(npub: NPub): Promise<Array<WebSocket['url']> | null> {
    return Promise.resolve([]);
  }

  async loadDirectMessageRelaysOnlyHavingPubkey(pubkey: string): Promise<Array<WebSocket['url']> | null> {
    const [relayListEvent] = await this.pool.query([
      {
        kinds: [ kinds.RelayList ],
        authors: [ pubkey ]
      }
    ], {
      /**
       * TODO: preciso centralizar isso como configuração
       */
      include: [ 'wss://purplepag.es' ]
    }).catch(() => Promise.resolve([null]));

    if (this.guard.isKind(relayListEvent, this.kindDirectMessageRelayList)) {
      const relayList = this.relayConverter.convertDirectMessageRelayEventToRelayList(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve(null);
  }

}
