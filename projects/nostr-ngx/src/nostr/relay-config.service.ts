import { Injectable } from '@angular/core';
import { TNip05 } from '../domain/nip05.type';
import { TNostrPublic } from '../domain/nostr-public.type';
import { TRelayMetadataRecord } from '../domain/relay-metadata.record';
import { INostrLocalConfig } from '../storage/nostr-local-config.interface';
import { IRelayMetadata } from '../domain/relay-metadata.interface';
import { NostrGuard } from './nostr.guard';
import { ConfigsLocalStorage } from '../storage/configs-local.storage';
import { queryProfile } from 'nostr-tools/nip05';
import { NostrService } from './nostr.service';
import { RelayConverter } from './relay.converter';
import { NostrEventKind } from '../domain/nostr-event-kind';
import { NostrConverter } from './nostr.converter';
import { SmartPool } from '../pool/smart.pool';

@Injectable({
  providedIn: 'root'
})
export class RelayConfigService {

  private static defaultAppRelays: TRelayMetadataRecord = {};

  static setDefaultApplicationRelays(relays: { [url: string]: Omit<IRelayMetadata, 'url'> }): void {
    this.defaultAppRelays = {};
    Object.keys(relays).forEach(url => {
      this.defaultAppRelays[url] = { url, ...relays[url] };
    });
  }

  constructor(
    private guard: NostrGuard,
    private nostrService: NostrService,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter,
    private configs: ConfigsLocalStorage
  ) { }

  /**
   * Override application default relays for unauthenticated
   * accounts and for accounts without any relay configured
   *
   * @param relays
   * @param npub 
   */
  setLocalRelays(relays: TRelayMetadataRecord, npub?: TNostrPublic): void {
    const local = this.configs.read();

    if (npub) {
      local.userRelays = local.userRelays || {};

      //  FIXME: devo associar os relays aos account, se não o usuário não terá como deletar seus relays
      local.userRelays[npub] = relays;
    } else {
      local.commonRelays = relays;
    }
  }

  /**
   * Return relays according to user-customized settings
   */
  getCurrentUserRelays(): Promise<TRelayMetadataRecord>;
  getCurrentUserRelays(nip5: TNip05): Promise<TRelayMetadataRecord>;
  getCurrentUserRelays(nostrPublic: TNostrPublic): Promise<TRelayMetadataRecord>;
  getCurrentUserRelays(userPublicAddress?: string): Promise<TRelayMetadataRecord>;
  async getCurrentUserRelays(userPublicAddress?: string): Promise<TRelayMetadataRecord> {
    const local = this.configs.read();
    const relayFrom = local.relayFrom;
    let relayRecord: TRelayMetadataRecord = {};

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

  private async getRelaysFromSigner(): Promise<TRelayMetadataRecord> {
    const relayRecordWithMetadata: Record<string, IRelayMetadata> = {};

    if (window.nostr) {
      const signerRelays = await window.nostr.getRelays();
      Object.keys(signerRelays).forEach(url => {
        const config = signerRelays[url];
        relayRecordWithMetadata[url] = {
          url, ...config
        };
      });
    }

    return Promise.resolve(relayRecordWithMetadata);
  }

  private getRelaysFromStorage(local: INostrLocalConfig): Promise<TRelayMetadataRecord>;
  private getRelaysFromStorage(local: INostrLocalConfig, nostrPublic: TNostrPublic): Promise<TRelayMetadataRecord>;
  private getRelaysFromStorage(local: INostrLocalConfig, userPublicAddress?: string): Promise<TRelayMetadataRecord>;
  private getRelaysFromStorage(local: INostrLocalConfig, userPublicAddress?: string): Promise<TRelayMetadataRecord> {
    if (!userPublicAddress) {
      return Promise.resolve(local.commonRelays || {});
    } else if (this.guard.isNostrPublic(userPublicAddress)) {
      return Promise.resolve(local.userRelays && local.userRelays[userPublicAddress] || {})
    }

    return Promise.resolve({});
  }

  async getUserPublicRelays(nip5: TNip05): Promise<TRelayMetadataRecord>;
  async getUserPublicRelays(nostrPublic: TNostrPublic): Promise<TRelayMetadataRecord>;
  async getUserPublicRelays(userPublicAddress: string): Promise<TRelayMetadataRecord>;
  async getUserPublicRelays(userPublicAddress: string): Promise<TRelayMetadataRecord> {

    if (this.guard.isNostrPublic(userPublicAddress)) {
      const pubhex = this.nostrConverter.castNostrPublicToPubkey(userPublicAddress);
      const [relayList] = await this.nostrService.request([
        {
          kinds: [ NostrEventKind.RelayList ],
          authors: [ pubhex ]
        }
      ]);

      this.relayConverter.convertNostrEventToRelayMetadata(relayList);
    } else {
      //  https://github.com/nostr-protocol/nips/blob/722ac7a58695a365be0dbb6eccb33ccd7890a8c7/65.md
      const pointer = await queryProfile(userPublicAddress);
      if (pointer && pointer.relays && pointer.relays.length) {
        const { pubkey, relays } = pointer;
        const pool = new SmartPool(relays);
        const [ relayListEvent ] = await this.nostrService.request([
          {
            authors: [ pubkey ],
            kinds: [ NostrEventKind.RelayList ],
            limit: 1
          }
        ], pool);

        const relayMetadata = this.relayConverter.convertNostrEventToRelayMetadata(relayListEvent);
        return Promise.resolve(relayMetadata);
      }
    }

    return Promise.resolve({});
  }
}
