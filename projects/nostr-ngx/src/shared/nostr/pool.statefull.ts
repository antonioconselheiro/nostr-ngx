import { Injectable } from '@angular/core';
import { SimplePool } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { fetchRelayInformation, RelayInformation } from 'nostr-tools/nip11';
import { TNip05 } from '../../domain/nip05.type';
import { INostrLocalConfig } from '../../domain/nostr-local-config.interface';
import { TNostrPublic } from '../../domain/nostr-public.type';
import { TRelayMap } from '../../domain/relay-map.type';
import { IRelayMetadata } from '../../domain/relay-metadata.interface';
import { ConfigsLocalStorage } from './configs-local.storage';
import { NostrGuard } from './nostr.guard';

/**
 * FIXME: talvéz a melhor saída não seja fazer um serviço para uma pool central, apesar de ter uma
 * pool central, ela não deve ser um service singleton, por que haverão outras pools de acordo com
 * o contexto da aplicação
 */
/**
 * Centralize relays information and status
 */
@Injectable({
  providedIn: 'root'
})
export class PoolStatefull {

  static currentPool: AbstractSimplePool = new SimplePool();

  private static defaultAppRelays: TRelayMap = {};

  /**
   * TODO: loaod nip11 data to details property
   */
  private static relayMetadata: Record<string, IRelayMetadata> = {};

  static setDefaultApplicationRelays(relays: TRelayMap): void {
    this.defaultAppRelays = relays;
  }

  constructor(
    private guard: NostrGuard,
    private configs: ConfigsLocalStorage
  ) { }

  connectRelay(...relays: string[]): void {
    this.connectRelays(relays, false);
  }

  connectCacheRelay(...relays: string[]): void {
    this.connectRelays(relays, true);
  }

  /**
   * Avoid to request relay nip11 twice, this service
   * will load relay details except if is already loaded
   */
  connectRelayWithLoadedDetails(relay: string, relayDetails: RelayInformation, isCache = false): void {
    const relayMetadata: IRelayMetadata = PoolStatefull.relayMetadata[relay] = {
      writeable: !isCache,
      details: relayDetails
    };

    PoolStatefull.currentPool.ensureRelay(relay)
      .then(conn => relayMetadata.conn = conn);
  }

  private connectRelays(relays: string[], isCache: boolean): void {
    relays.forEach(relay => {
      const relayMetadata: IRelayMetadata = PoolStatefull.relayMetadata[relay] = {
        writeable: !isCache
      };

      PoolStatefull.currentPool.ensureRelay(relay)
        .then(conn => relayMetadata.conn = conn);

      fetchRelayInformation(relay)
        .then(details => relayMetadata.details = details);
    });
  }

  disconnectRelay(...relays: string[]): void {
    relays.forEach(relay => {
      delete PoolStatefull.relayMetadata[relay];
    });
    PoolStatefull.currentPool.close(relays);
  }

  disconnectAllRelays(): void {
    PoolStatefull.currentPool.close(Object.keys(PoolStatefull.relayMetadata));
    PoolStatefull.relayMetadata = {};
  }

  filterWritableRelays(relays: TRelayMap | string[]): string[] {
    if (relays instanceof Array) {
      return relays;
    }

    return Object
      .keys(relays)
      .filter(relay => relays[relay].write);
  }

  filterReadableRelays(relays: TRelayMap | string[]): string[] {
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
  setLocalRelays(relays: TRelayMap, npub?: TNostrPublic) {
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
  getCurrentUserRelays(): Promise<TRelayMap>;
  getCurrentUserRelays(nip5: TNip05): Promise<TRelayMap>;
  getCurrentUserRelays(nostrPublic: TNostrPublic): Promise<TRelayMap>;
  getCurrentUserRelays(userPublicAddress?: string): Promise<TRelayMap>;
  async getCurrentUserRelays(userPublicAddress?: string): Promise<TRelayMap> {
    const local = this.configs.read();
    const relayFrom = local.relayFrom;
    let relays: TRelayMap = {};

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
      relays = PoolStatefull.defaultAppRelays;
    }

    console.info('local configs', local);
    console.info('result relays', relays);
    return relays;
  }

  private getRelaysFromSigner(): Promise<TRelayMap> {
    if (window.nostr) {
      return window.nostr.getRelays();
    }

    return Promise.resolve({});
  }

  private getRelaysFromStorage(local: INostrLocalConfig): Promise<TRelayMap>;
  private getRelaysFromStorage(local: INostrLocalConfig, nostrPublic: TNostrPublic): Promise<TRelayMap>;
  private getRelaysFromStorage(local: INostrLocalConfig, userPublicAddress?: string): Promise<TRelayMap>;
  private getRelaysFromStorage(local: INostrLocalConfig, userPublicAddress?: string): Promise<TRelayMap> {
    if (!userPublicAddress) {
      return Promise.resolve(local.commonRelays || {});
    } else if (this.guard.isNostrPublic(userPublicAddress)) {
      return Promise.resolve(local.userRelays && local.userRelays[userPublicAddress] || {})
    }

    return Promise.resolve({});
  }

  getUserPublicRelays(nip5: TNip05): Promise<TRelayMap>;
  getUserPublicRelays(nostrPublic: TNostrPublic): Promise<TRelayMap>;
  getUserPublicRelays(userPublicAddress: string): Promise<TRelayMap>;
  getUserPublicRelays(userPublicAddress: string): Promise<TRelayMap> {
    /**
     * TODO: preciso consultar o nip5 do usuário, tlvz lá tenha uma
     * listagem de relays,
     * se eu tiver o npub no lugar do nip5 eu preciso descobrir em
     * ual relay irei buscar pela listagem de relays do usuário
     */
    return Promise.resolve({});
  }
}