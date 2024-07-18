import { Injectable } from '@angular/core';
import { SimplePool } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { fetchRelayInformation, RelayInformation } from 'nostr-tools/nip11';
import { IRelayMetadata } from '../../domain/relay-metadata.interface';
import { DerivatedPool } from '../../pool/derivated.pool';

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
export class MainPoolStatefull {

  static currentPool: AbstractSimplePool = new SimplePool();
  static readPool = new DerivatedPool([MainPoolStatefull.currentPool]);
  static writePool = new DerivatedPool([MainPoolStatefull.currentPool]);

  /**
   * TODO: loaod nip11 data to details property
   */
  private static relayMetadata: Record<string, IRelayMetadata> = {};

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
    const relayMetadata: IRelayMetadata = MainPoolStatefull.relayMetadata[relay] = {
      url: relay,
      write: !isCache,
      details: relayDetails
    };

    MainPoolStatefull.currentPool.ensureRelay(relay)
      .then(conn => (relayMetadata as any).conn = conn);
  }

  private connectRelays(relays: string[], isCache: boolean): void {
    relays.forEach(relay => {
      const relayMetadata: IRelayMetadata = MainPoolStatefull.relayMetadata[relay] = {
        url: relay,
        write: !isCache
      };

      MainPoolStatefull.currentPool.ensureRelay(relay)
        .then(conn => (relayMetadata as any).conn = conn);

      fetchRelayInformation(relay)
        .then(details => relayMetadata.details = details);
    });
  }

  disconnectRelay(...relays: string[]): void {
    relays.forEach(relay => {
      delete MainPoolStatefull.relayMetadata[relay];
    });
    MainPoolStatefull.currentPool.close(relays);
  }

  disconnectAllRelays(): void {
    MainPoolStatefull.currentPool.close(Object.keys(MainPoolStatefull.relayMetadata));
    MainPoolStatefull.relayMetadata = {};
  }
}
