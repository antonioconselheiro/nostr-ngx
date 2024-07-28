import { Event, Filter } from 'nostr-tools';
import { SubCloser, SubscribeManyParams } from 'nostr-tools/abstract-pool';
import { AbstractRelay } from 'nostr-tools/abstract-relay';
import { fetchRelayInformation, RelayInformation } from 'nostr-tools/nip11';
import { normalizeURL } from 'nostr-tools/utils';
import { Observable } from 'rxjs';
import { IRelayMetadata } from '../domain/relay-metadata.interface';
import { TRelayMetadataRecord } from '../domain/relay-metadata.record';
import { ExtendablePool } from './extendable.pool';
import { observePool } from './observe-pool.fn';

/**
 * SmartPool is a facade to nostr-tools SimplePool,
 * it controls when use read relays and when use write relays,
 * also it load nip11 relay details before connect
 */
export class SmartPool {

  /**
   * Stores nip11 relay information loaded, this avoid
   * to request again for information from the same relay 
   */
  private static relaysDetails: Record<string, RelayInformation | undefined> = {};

  protected pool: ExtendablePool = new ExtendablePool();
  relays: TRelayMetadataRecord = {};
  trustedRelayURLs = this.pool.trustedRelayURLs;

  constructor(relays: string[] = []) {
    relays.forEach(relay => this.ensureRelay(relay));
  }

  ensureRelay(url: string, params?: Omit<IRelayMetadata, 'url'>): Promise<AbstractRelay> {
    let metadata: IRelayMetadata;
    if (!params) {
      metadata = {
        url: normalizeURL(url),
        read: true,
        write: true
      };
    } else {
      metadata = {
        url: normalizeURL(url),
        ...params
      };
    }

    if (!metadata.details) {
      if (SmartPool.relaysDetails[metadata.url]) {
        metadata.details = SmartPool.relaysDetails[metadata.url];
      } else {
        fetchRelayInformation(metadata.url)
          .then(details => {
            metadata.details = details;
            SmartPool.relaysDetails[metadata.url] = details;
          })
          .catch(e => console.error(`failed to load nip11 relay details from ${metadata.url}`, e))
      }
    }

    this.relays[metadata.url] = metadata;
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

  /**
   * on add relay, on close relay and when relay changes it connection status
   */
  observeConnection(): Observable<void> {
    return observePool(this.pool).changes;
  }

  private getReadableRelays(): string[] {
    return Object.keys(this.relays).filter(relay => this.relays[relay].read);
  }

  private getWritableRelays(): string[] {
    return Object.keys(this.relays).filter(relay => this.relays[relay].write);
  }

  protected getPoolRelays(): Map<string, AbstractRelay> {
    return this.pool.getRelays();
  }

  listConnectionStatus(): Map<string, boolean> {
    const map = new Map<string, boolean>();
    this.pool.getRelays()
      .forEach((relay: AbstractRelay, url: string) => map.set(url, relay.connected));

    return map;
  }

  close(relays: string[]): void {
    const toClose: string[] = [];
    relays.map(normalizeURL).forEach(relay => {
      const details = this.relays[relay];
      delete this.relays[relay];

      if (!details.inherited) {
        toClose.push(relay);
      }
    });

    return this.pool.close(toClose);
  }

  destroy(): void {
    const toDestroy: string[] = [];
    Object.keys(this.relays).forEach(relay => {
      if (!this.relays[relay].inherited) {
        toDestroy.push(relay);
      }
    });

    this.pool.close(toDestroy);
    this.pool.resetRelays();
    this.relays = {};
  }
}
