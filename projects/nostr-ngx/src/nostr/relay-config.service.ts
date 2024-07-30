import { Injectable } from '@angular/core';
import { TNip05 } from '../domain/nip05.type';
import { TNostrPublic } from '../domain/nostr-public.type';
import { TRelayMetadataRecord } from '../domain/relay-metadata.record';
import { INostrLocalConfig } from '../storage/nostr-local-config.interface';
import { IRelayMetadata } from '../domain/relay-metadata.interface';
import { NostrGuard } from './nostr.guard';
import { ConfigsLocalStorage } from '../storage/configs-local.storage';
import { queryProfile } from 'nostr-tools/nip05';

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
    private configs: ConfigsLocalStorage
  ) { }

  /**
   * Override application default relays for unauthenticated
   * accounts and for accounts without any relay configured
   *
   * @param relays
   * @param npub 
   */
  setLocalRelays(relays: TRelayMetadataRecord, npub?: TNostrPublic) {
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
        const relays = await this.getUserPublicRelays(userPublicAddress);
        relays.forEach(relay => relayRecord[relay] = { url: relay, write: true, read: true });
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

  getUserPublicRelays(nip5: TNip05): Promise<string[]>;
  getUserPublicRelays(nostrPublic: TNostrPublic): Promise<string[]>;
  getUserPublicRelays(userPublicAddress: string): Promise<string[]>;
  getUserPublicRelays(userPublicAddress: string): Promise<string[]> {

    if (this.guard.isNostrPublic(userPublicAddress)) {
      //  TODO: pesquisar relays publicos do usuário a partir do npub
      //  https://github.com/nostr-protocol/nips/blob/722ac7a58695a365be0dbb6eccb33ccd7890a8c7/65.md
    } else {
      return queryProfile(userPublicAddress).then(userInfo => userInfo?.relays || []);
    }

    return Promise.resolve([]);
  }
}
