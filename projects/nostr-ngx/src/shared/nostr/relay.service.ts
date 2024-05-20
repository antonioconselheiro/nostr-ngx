import { Injectable } from '@angular/core';
import { NostrConfigStorage } from './nostr-config.storage';
import { TNip5Type } from '../../domain/nip5.type';
import { TNostrPublic } from '../../domain/nostr-public.type';
import { TRelayMap } from '../../domain/relay-map.type';

/**
 * TODO:
 * Essa classe deverá ler os relays configurados na ferramenta,
 * os relays publicamente associados a conta e os relays registrados
 * na extensão.
 * 
 * A classe deve conter um método onde ele indica se é capaz ou não
 * de editar os relays default, sendo capaz de editar os públicos e
 * os configurados localmente na ferramenta.
 * 
 * A classe deve ter meios alterar as configurações de relays quando
 * possível.
 */
@Injectable({
  providedIn: 'root'
})
export class RelayService {

  constructor(
    private nostrConfigStorage: NostrConfigStorage
  ) { }

  getMyRelays(): TRelayMap {
    const relayFrom = this.nostrConfigStorage.readLocalStorage().relayFrom;
    if (relayFrom === 'signer') {
      return this.getRelaysFromSigner();
    } else if (relayFrom === 'localStorage') {
      return this.getRelaysFromStorage();
    } else if (relayFrom === 'public') {
      if (userPublicAddress) {
        return this.getUserPublicRelays(userPublicAddress);
      }
    }

    return {};
  }

  private getRelaysFromSigner(): TRelayMap {

  }

  private getRelaysFromStorage(): TRelayMap;
  private getRelaysFromStorage(nip5: TNip5Type): TRelayMap;
  private getRelaysFromStorage(nostrPublic: TNostrPublic): TRelayMap;
  private getRelaysFromStorage(userPublicAddress?: string): TRelayMap;
  private getRelaysFromStorage(userPublicAddress?: string): TRelayMap {

  }

  getUserPublicRelays(nip5: TNip5Type): TRelayMap;
  getUserPublicRelays(nostrPublic: TNostrPublic): TRelayMap;
  getUserPublicRelays(userPublicAddress: string): TRelayMap;
  getUserPublicRelays(userPublicAddress: string): TRelayMap {

  }
}
