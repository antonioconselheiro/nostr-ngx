import { Injectable } from '@angular/core';
import { NostrConfigStorage } from './nostr-config.storage';
import { TNip05 } from '../../domain/nip05.type';
import { TNostrPublic } from '../../domain/nostr-public.type';
import { TRelayMap } from '../../domain/relay-map.type';
import { NostrGuard } from './nostr.guard';
import { INostrLocalConfig } from '../../domain/nostr-local-config.interface';

@Injectable({
  providedIn: 'root'
})
export class RelayService {

  constructor(
    private guard: NostrGuard,
    private configs: NostrConfigStorage
  ) { }

  filterWritableRelays(relays: TRelayMap): string[] {
    return Object
      .keys(relays)
      .filter(relay => relays[relay].write);
  }

  filterReadableRelays(relays: TRelayMap): string[] {
    return Object
      .keys(relays)
      .filter(relay => relays[relay].read);
  }

  setLocalRelays(relays: TRelayMap, npub?: TNostrPublic) {
    const local = this.configs.readLocalStorage();

    if (npub) {
      local.userRelays = local.userRelays || {};
      local.userRelays[npub] = relays;
    } else {
      local.commonRelays = relays;
    }
  }

  getCurrentUserRelays(): Promise<TRelayMap>;
  getCurrentUserRelays(nip5: TNip05): Promise<TRelayMap>;
  getCurrentUserRelays(nostrPublic: TNostrPublic): Promise<TRelayMap>;
  getCurrentUserRelays(userPublicAddress?: string): Promise<TRelayMap>;
  getCurrentUserRelays(userPublicAddress?: string): Promise<TRelayMap> {
    const local = this.configs.readLocalStorage();
    const relayFrom = local.relayFrom;

    if (relayFrom === 'signer') {
      return this.getRelaysFromSigner();
    } else if (relayFrom === 'localStorage') {
      return this.getRelaysFromStorage(local, userPublicAddress);
    } else if (relayFrom === 'public') {
      if (userPublicAddress) {
        return this.getUserPublicRelays(userPublicAddress);
      }
    }

    return Promise.resolve({});
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
