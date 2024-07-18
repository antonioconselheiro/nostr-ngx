import { Injectable } from '@angular/core';
import { TNip05 } from '../../domain/nip05.type';
import { TNostrPublic } from '../../domain/nostr-public.type';
import { TRelayMetadataRecord } from '../../domain/relay-metadata.record';
import { INostrLocalConfig } from '../../storage/nostr-local-config.interface';
import { IRelayMetadata } from '../../domain/relay-metadata.interface';
import { NostrGuard } from './nostr.guard';
import { ConfigsLocalStorage } from '../../storage/configs-local.storage';

@Injectable({
  providedIn: 'root'
})
export class RelayService {

  private static defaultAppRelays: TRelayMetadataRecord = {};

  static setDefaultApplicationRelays(relays: TRelayMetadataRecord): void {
    this.defaultAppRelays = relays;
  }

  constructor(
    private guard: NostrGuard,
    private configs: ConfigsLocalStorage
  ) { }

  filterWritableRelays(relays: TRelayMetadataRecord | string[]): string[] {
    if (relays instanceof Array) {
      return relays;
    }

    return Object
      .keys(relays)
      .filter(relay => relays[relay].write);
  }

  filterReadableRelays(relays: TRelayMetadataRecord | string[]): string[] {
    if (relays instanceof Array) {
      return relays;
    }

    return Object
      .keys(relays)
      .filter(relay => relays[relay].read);
  }

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
    let relays: TRelayMetadataRecord = {};

    if (relayFrom === 'signer') {
      relays = await this.getRelaysFromSigner();
    } else if (relayFrom === 'localStorage') {
      relays = await this.getRelaysFromStorage(local, userPublicAddress);
    } else if (relayFrom === 'public') {
      if (userPublicAddress) {
        relays = await this.getUserPublicRelays(userPublicAddress);
      }
    }

    if (!Object.keys(relays).length) {
      relays = RelayService.defaultAppRelays;
    }

    console.info('local configs', local);
    console.info('result relays', relays);
    return relays;
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

  getUserPublicRelays(nip5: TNip05): Promise<TRelayMetadataRecord>;
  getUserPublicRelays(nostrPublic: TNostrPublic): Promise<TRelayMetadataRecord>;
  getUserPublicRelays(userPublicAddress: string): Promise<TRelayMetadataRecord>;
  getUserPublicRelays(userPublicAddress: string): Promise<TRelayMetadataRecord> {
    /**
     * TODO: preciso consultar o nip5 do usuário, tlvz lá tenha uma
     * listagem de relays,
     * se eu tiver o npub no lugar do nip5 eu preciso descobrir em
     * ual relay irei buscar pela listagem de relays do usuário
     */
    return Promise.resolve({});
  }
}
