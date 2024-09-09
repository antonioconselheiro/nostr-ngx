import { Injectable } from '@angular/core';
import { queryProfile } from 'nostr-tools/nip05';
import { RelayRecord } from 'nostr-tools/relay';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';
import { NostrLocalConfig } from '../configs/nostr-local-config.interface';
import { Nip05 } from '../domain/nip05.type';
import { NostrEventKind } from '../domain/nostr-event-kind';
import { Nprofile } from '../domain/nostr-profile.type';
import { Npub } from '../domain/nostr-public.type';
import { NostrConverter } from '../nostr/nostr.converter';
import { NostrGuard } from '../nostr/nostr.guard';
import { RelayConverter } from '../nostr/relay.converter';
import { MainPool } from './main.pool';
import { nip19 } from 'nostr-tools';

@Injectable({
  providedIn: 'root'
})
export class RelayConfigService {

  private static defaultAppRelays: RelayRecord = {};

  static setDefaultApplicationRelays(relays: RelayRecord): void {
    this.defaultAppRelays = relays;
  }

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
  setLocalRelays(relays: RelayRecord, npub?: Npub): void {
    const local = this.configs.read();

    if (npub) {
      if (!local.accounts) {
        local.accounts = {};
      }

      if (local.accounts[npub]) {
        local.accounts[npub].relays = relays;
      } else {
        local.accounts[npub] = { relays };
      }
    } else {
      local.commonRelays = relays;
    }
  }

  /**
   * Return relays according to user-customized settings
   */
  getCurrentUserRelays(): Promise<RelayRecord>;
  getCurrentUserRelays(nip5: Nip05): Promise<RelayRecord>;
  getCurrentUserRelays(nostrPublic: Npub): Promise<RelayRecord>;
  getCurrentUserRelays(nostrPublic: Npub): Promise<RelayRecord>;
  getCurrentUserRelays(userPublicAddress?: string): Promise<RelayRecord>;
  async getCurrentUserRelays(userPublicAddress?: string): Promise<RelayRecord> {
    const local = this.configs.read();
    const relayFrom = local.relayFrom;
    let relayRecord: RelayRecord = {};

    if (relayFrom === 'signer') {
      relayRecord = await this.getRelaysFromSigner();
    } else if (relayFrom === 'localStorage') {
      relayRecord = await this.getRelaysFromStorage(local, userPublicAddress);
    } else if (relayFrom === 'public') {
      if (userPublicAddress) {
        relayRecord = await this.getUserPublicRelays(userPublicAddress);
      }
    }

    if (!Object.keys(relayRecord).length) {
      relayRecord = RelayConfigService.defaultAppRelays;
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
  private getRelaysFromStorage(local: NostrLocalConfig, nostrPublic: Npub): Promise<RelayRecord>;
  private getRelaysFromStorage(local: NostrLocalConfig, userPublicAddress?: string): Promise<RelayRecord>;
  private getRelaysFromStorage(local: NostrLocalConfig, userPublicAddress?: string): Promise<RelayRecord> {
    if (!userPublicAddress) {
      return Promise.resolve(local.commonRelays || {});
    } else if (this.guard.isNostrPublic(userPublicAddress)) {
      return Promise.resolve(local.accounts && local.accounts[userPublicAddress].relays || {})
    }

    return Promise.resolve({});
  }

  async getUserPublicRelays(nip5: Nip05): Promise<RelayRecord>;
  async getUserPublicRelays(nostrPublic: Npub): Promise<RelayRecord>;
  async getUserPublicRelays(userPublicAddress: string): Promise<RelayRecord>;
  async getUserPublicRelays(userPublicAddress: string): Promise<RelayRecord> {

    if (this.guard.isNostrPublic(userPublicAddress)) {

    } else {

    }

    return Promise.resolve({});
  }

  async loadRelaysFromNprofile(nprofile: Nprofile): Promise<RelayRecord | null> {
    const pointer = nip19.decode(nprofile);
    if (pointer.data.relays?.length) {
      const [relayListEvent] = await this.pool.query([
        {
          kinds: [ NostrEventKind.RelayList ],
          authors: [ pointer.data.pubkey ]
        }
      ], {
        useOnly: pointer.data.relays
      }).catch(() => Promise.resolve([null]));

      if (relayListEvent) {
        const relayList = this.relayConverter.convertNostrEventToRelayMetadata(relayListEvent);
        return Promise.resolve(relayList);
      }
    }

    return Promise.resolve(null);
  }

  async loadRelaysFromNIP5(nip5: Nip05): Promise<RelayRecord | null> {
    const pointer = await queryProfile(nip5);
    if (pointer && pointer.relays && pointer.relays.length) {
      const { pubkey } = pointer;
      const [ relayListEvent ] = await this.pool.query([
        {
          authors: [ pubkey ],
          kinds: [ NostrEventKind.RelayList ],
          limit: 1
        }
      ], {
        useOnly: [ pointer ]
      }).catch(() => Promise.resolve([null]));

      if (relayListEvent) {
        const relayList = this.relayConverter.convertNostrEventToRelayMetadata(relayListEvent);
        return Promise.resolve(relayList);
      }
    }

    return Promise.resolve(null);
  }

  async loadRelaysOnlyHavingNpub(npub: Npub): Promise<RelayRecord | null> {
    const pubhex = this.nostrConverter.castNostrPublicToPubkey(npub);
    const [relayListEvent] = await this.pool.query([
      {
        kinds: [ NostrEventKind.RelayList ],
        authors: [ pubhex ]
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
