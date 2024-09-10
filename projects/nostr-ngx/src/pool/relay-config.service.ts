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
      relayRecord = await this.getRelaysFromStorage(local, userPublicAddress);
    } else if (relayFrom === 'public') {
      if (userPublicAddress) {
        relayRecord = await this.getUserPublicRelays(userPublicAddress);
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

  private getRelaysFromStorage(local: NostrLocalConfig): Promise<RelayRecord>;
  private getRelaysFromStorage(local: NostrLocalConfig, nostrPublic: NPub): Promise<RelayRecord>;
  private getRelaysFromStorage(local: NostrLocalConfig, userPublicAddress?: string): Promise<RelayRecord>;
  private getRelaysFromStorage(local: NostrLocalConfig, userPublicAddress?: string): Promise<RelayRecord> {
    if (!userPublicAddress) {
      return Promise.resolve(local.commonRelays || {});
    } else if (this.guard.isNPub(userPublicAddress)) {
      return Promise.resolve(local.accounts && local.accounts[userPublicAddress].relays || {})
    }

    return Promise.resolve({});
  }

  async getUserPublicRelays(nip5: Nip05): Promise<RelayRecord | null>;
  async getUserPublicRelays(npub: NPub): Promise<RelayRecord | null>;
  async getUserPublicRelays(nprofile: NProfile): Promise<RelayRecord | null>;
  async getUserPublicRelays(pubkey: string): Promise<RelayRecord | null>;
  async getUserPublicRelays(userPublicAddress: string): Promise<RelayRecord | null> {
    const HEXADECIMAL_REGEX = /^[a-f\d]+$/;
    if (this.guard.isNip05(userPublicAddress)) {
      return this.loadRelaysFromNIP5(userPublicAddress);
    } else if (this.guard.isNPub(userPublicAddress)) {
      return this.loadRelaysOnlyHavingNpub(userPublicAddress);
    } else if (this.guard.isNProfile(userPublicAddress)) {
      return this.loadRelaysFromNprofile(userPublicAddress);
    } else if (HEXADECIMAL_REGEX.test(userPublicAddress)) {
      return this.loadRelaysOnlyHavingPubkey(userPublicAddress);
    }

    return Promise.resolve(null);
  }

  async loadRelaysFromProfilePointer(pointer: ProfilePointer): Promise<RelayRecord | null> {
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

      if (relayListEvent) {
        const relayList = this.relayConverter.convertNostrEventToRelayMetadata(relayListEvent);
        return Promise.resolve(relayList);
      }

      return this.loadRelaysOnlyHavingPubkey(pubkey);
    }

    return Promise.resolve(null);
  }

  async loadRelaysFromNprofile(nprofile: NProfile): Promise<RelayRecord | null> {
    return this.loadRelaysFromProfilePointer(nip19.decode(nprofile).data);
  }

  async loadRelaysFromNIP5(nip5: Nip05): Promise<RelayRecord | null> {
    const pointer = await queryProfile(nip5);

    if (pointer) {
      return this.loadRelaysFromProfilePointer(pointer);
    }

    return Promise.resolve(null);
  }

  async loadRelaysOnlyHavingNpub(npub: NPub): Promise<RelayRecord | null> {
    const pubkey = this.nostrConverter.castNostrPublicToPubkey(npub);
    return this.loadRelaysOnlyHavingPubkey(pubkey);
  }

  async loadRelaysOnlyHavingPubkey(pubkey: string): Promise<RelayRecord | null> {
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

    if (relayListEvent) {
      const relayList = this.relayConverter.convertNostrEventToRelayMetadata(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve(null);
  }
}
