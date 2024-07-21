import { Injectable } from '@angular/core';
import { SimplePool } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { TRelayMetadataRecord } from '../domain/relay-metadata.record';
import { normalizeURL } from 'nostr-tools/utils';
import { IRelayMetadata } from '../domain/relay-metadata.interface';
import { fetchRelayInformation } from 'nostr-tools/nip11';
import { SmartPool } from '../pool/smart.pool';

/**
 * Centralize relays information and status
 */
@Injectable({
  providedIn: 'root'
})
export class MainPoolStatefull {

  static currentPool: SmartPool = new SmartPool();
  static currentRelays: TRelayMetadataRecord = {};

}
