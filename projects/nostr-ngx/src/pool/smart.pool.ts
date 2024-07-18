import { Filter, NostrEvent } from 'nostr-tools';
import { SubCloser, SubscribeManyParams } from 'nostr-tools/pool';
import { AbstractRelay } from 'nostr-tools/relay';
import { IRelayMetadata } from '../domain/relay-metadata.interface';
import { AbstractPool } from './abstract.pool';
import { RelayInformation } from 'nostr-tools/nip11';

/**
 * -> Read/Write control - follow the read/write relay config, so, it
 * won't publish if relays is configured as readonly
 * 
 * -> Can be configured to load relay details (NIP11) on connect.
 */
export class SmartPool extends AbstractPool {

  protected relaysMetadata: Record<string, IRelayMetadata> = {};

  override ensureRelay(url: string, params?: Partial<IRelayMetadata> & { details: RelayInformation }): Promise<AbstractRelay> {
    this.relaysMetadata[url] = { url, ...params };
    return super.ensureRelay(url, params);
  }

  override subscribeManyMap(requests: { [relay: string]: Filter[] }, params: SubscribeManyParams): SubCloser {
    return super.subscribeManyMap(requests, params);
  }

  override publish(relays: string[], event: NostrEvent): Promise<string>[] {
    return super.publish(relays, event);
  }

  override close(relays: string[]): void {
    relays.forEach(relay => {
      delete this.relaysMetadata[relay];
    });

    super.close(relays);
  }
}
