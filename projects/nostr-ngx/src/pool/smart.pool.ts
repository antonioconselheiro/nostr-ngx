import { TRelayMetadataRecord } from '@belomonte/nostr-ngx';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { SubCloser, SubscribeManyParams } from 'nostr-tools/abstract-pool';
import { AbstractRelay } from 'nostr-tools/abstract-relay';
import { fetchRelayInformation } from 'nostr-tools/nip11';
import { normalizeURL } from 'nostr-tools/utils';
import { IRelayMetadata } from '../domain/relay-metadata.interface';
import { ExtendedPool } from './extended.pool';

/**
 * SmartPool is a facade to nostr-tools SimplePool,
 * it controls when use read relays and when use write relays,
 * also it load nip11 relay details before connect
 */
export class SmartPool {

  relays: TRelayMetadataRecord = {};
  pool = new SimplePool();
  trustedRelayURLs = this.pool.trustedRelayURLs;

  ensureRelay(url: string, params?: IRelayMetadata): Promise<AbstractRelay> {
    if (!params) {
      params = {
        url: normalizeURL(url),
        read: true,
        write: true
      };
    }

    if (!params.details) {
      fetchRelayInformation(params.url)
        .then(details => params.details = details)
        .catch(e => console.error(`failed to load nip11 relay details from ${params.url}`, e))
    }

    this.relays[params.url] = params;
    return this.pool.ensureRelay(url, params);
  }

  subscribeMany(filters: Filter[], params: SubscribeManyParams): SubCloser {
    const relays = this.getReadableRelays();
    return this.pool.subscribeMany(relays, filters, params);
  }

  subscribeManyEose(filters: Filter[], params: Pick<SubscribeManyParams, 'id' | 'onevent' | 'onclose' | 'maxWait'>): SubCloser {
    const relays = this.getReadableRelays();
    return this.pool.subscribeManyEose(relays, filters, params);
  }

  querySync(filter: Filter, params?: Pick<SubscribeManyParams, 'id' | 'maxWait'>): Promise<Event[]> {
    const relays = this.getReadableRelays();
    return this.pool.querySync(relays, filter, params);
  }

  get(filter: Filter, params?: Pick<SubscribeManyParams, 'id' | 'maxWait'>): Promise<Event | null> {
    const relays = this.getReadableRelays();
    return this.pool.get(relays, filter, params);
  }

  publish(event: Event): Promise<string>[] {
    const relays = this.getWritableRelays();
    return this.pool.publish(relays, event);
  }

  close(relays: string[]): void {
    relays.map(normalizeURL).forEach(relay => {
      delete this.relays[relay];
    });

    return this.pool.close(relays);
  }

  extend(relays: string[] = []): ExtendedPool {
    return new ExtendedPool(this, relays);
  }

  private getReadableRelays(): string[] {
    return Object.keys(this.relays).filter(relay => this.relays[relay].read);
  }

  private getWritableRelays(): string[] {
    return Object.keys(this.relays).filter(relay => this.relays[relay].write);
  }

  listConnectionStatus(): Map<string, boolean> {
    const map = new Map<string, boolean>();
    (this.pool as any).relays
      .forEach((relay: AbstractRelay, url: string) => map.set(url, relay.connected));

    return map;
  }

  destroy(): void {
    (this.pool as any).relays.forEach((conn: AbstractRelay) => conn.close());
    (this.pool as any).relays = new Map();
  }
}
