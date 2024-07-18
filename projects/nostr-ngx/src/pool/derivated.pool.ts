import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { AbstractRelay } from 'nostr-tools/abstract-relay';
import { normalizeURL } from 'nostr-tools/utils';
import { AbstractPool } from './abstract.pool';

/**
 * A derivated pool that should not be able to close relays from derivated pools,
 * but can reuse it connections.
 */
export class DerivatedPool extends AbstractPool {

  private derivatedRelays: Map<string, AbstractRelay>;

  override readonly trustedRelayURLs!: Set<string>;

  constructor(pools: AbstractSimplePool[], relays: string[] = []) {
    super();

    this.derivatedRelays = new Map<string, AbstractRelay>();
    pools.forEach(pool => {
      const relays = (pool as any as { relays: Map<string, AbstractRelay> }).relays;
      for (let touple of relays.entries()) {
        const [relay, conn] = touple;
        this.derivatedRelays.set(relay, conn);
        this.relays.set(relay, conn);
      }
    });

    relays.forEach(relay => this.ensureRelay(relay));
  }

  override ensureRelay(url: string, params?: { connectionTimeout?: number | undefined; } | undefined): Promise<AbstractRelay> {
    url = normalizeURL(url);
    const existingConnection = this.derivatedRelays.get(url);
    if (existingConnection) {
      this.relays.set(url, existingConnection);
      return Promise.resolve(existingConnection);
    }

    return super.ensureRelay(url, params);
  }

  override close(relays?: string[]): void {
    const derivatedRelaysList = Array.from(this.derivatedRelays).map(([relay]) => relay);

    let aditionalRelays = Array.from(this.relays)
      .filter(([relay]) => !derivatedRelaysList.includes(relay))
      .map(([relay]) => relay);

    if (relays) {
      aditionalRelays = aditionalRelays.filter(relay => relays.includes(relay));
    }

    super.close(aditionalRelays);
  }

  override destroy(): void {
    const keys = Array.from(this.derivatedRelays.keys());
    this.relays.forEach((conn, url) => {
      if (!keys.includes(url)) {
        conn.close();
      }
    });
    this.relays = new Map();
  }
}