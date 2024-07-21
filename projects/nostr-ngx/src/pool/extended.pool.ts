import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { AbstractRelay } from 'nostr-tools/relay';
import { normalizeURL } from 'nostr-tools/utils';
import { SmartPool } from './smart.pool';

/**
 * A extended pool that should not be able to close relays from father pool,
 * but can use it's connections.
 * 
 * This pool will reuse ALL ACTIVE CONNECTIONS from a father pool and will
 * able to have it customs connections. It'll be not able to close inherited
 * relays.
 * 
 * If you don't want to connect in all inherited relays, but reuse connections,
 * you should use DerviatedSimplePool.
 */
export class ExtendedPool extends SmartPool {

  private inheritedRelays: string[] = [];

  constructor(fatherPool: SmartPool, relays: string[]) {
    super();

    const fatherRelays = (fatherPool as any as { relays: Map<string, AbstractRelay> }).relays.entries();
    for (let touple of fatherRelays) {
      const [ relay, conn ] = touple;
      this.inheritedRelays.push(relay);
      this.relays.set(relay, conn);
    }

    relays.forEach(relay => {
      const url = normalizeURL(relay);
      if (!this.inheritedRelays.includes(url)) {
        this.ensureRelay(url);
      }
    });   
  }

  override close(relays: string[]): void {
    let aditionalRelays = Array.from(this.relays)
      .filter(([relay]) => !this.inheritedRelays.includes(relay))
      .map(([relay]) => relay);

    if (relays) {
      aditionalRelays = aditionalRelays.filter(relay => relays.includes(relay));
    }

    super.close(aditionalRelays);
  }

  override destroy(): void {
    this.relays.forEach((conn, url) => {
      if (!this.inheritedRelays.includes(url)) {
        conn.close();
      }
    });
    this.relays = new Map();
  }
}