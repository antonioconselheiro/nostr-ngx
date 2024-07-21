import { Injectable } from '@angular/core';
import { SimplePool } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { TRelayMetadataRecord } from '../domain/relay-metadata.record';
import { normalizeURL } from 'nostr-tools/utils';
import { IRelayMetadata } from '../domain/relay-metadata.interface';
import { fetchRelayInformation } from 'nostr-tools/nip11';

/**
 * Centralize relays information and status
 */
@Injectable({
  providedIn: 'root'
})
export class MainPoolStatefull {

  static currentPool: AbstractSimplePool = new SimplePool();
  static currentRelays: TRelayMetadataRecord = {};

  static getRelayMetadata(url: string): IRelayMetadata | null {
    return this.currentRelays[normalizeURL(url)] || null;
  }

  static addRelay(relay: string, relayConfig?: IRelayMetadata): void {
    if (!relayConfig) {
      relayConfig = {
        url: normalizeURL(relay),
        read: true,
        write: true
      };
    }

    if (!relayConfig.details) {
      fetchRelayInformation(relayConfig.url)
        .then(details => relayConfig.details = details)
        .catch(e => console.error(`failed to load nip11 relay details from ${relayConfig.url}`))
    }
  }

  static removeRelay(relay: string): void {
    delete this.currentRelays[normalizeURL(relay)];
    this.currentPool.close([relay]);
  }
}
