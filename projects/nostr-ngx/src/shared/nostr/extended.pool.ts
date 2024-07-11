import { SimplePool } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { AbstractRelay } from 'nostr-tools/relay';
import { normalizeURL } from 'nostr-tools/utils';
import { AbstractPool } from './abstract.pool';

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
export class ExtendedPool extends AbstractPool {

  private inheritedRelays: string[] = [];
  override readonly trustedRelayURLs!: Set<string>;

  constructor(fatherPool: AbstractSimplePool, relays: string[]) {
    super();
    Object.assign(this, fatherPool);
    this.initRelays();
    this.seenOn = new Map();

    for (let touple of (fatherPool as any as { relays: Map<string, AbstractRelay> }).relays.entries()) {
      const [ relay, conn ] = touple;
      this.inheritedRelays.push(relay);
      this.addRelay(relay, conn);
    }

    relays.forEach(relay => {
      const url = normalizeURL(relay);
      if (!this.inheritedRelays.includes(url)) {
        this.ensureRelay(url);
      }
    });   
  }

  override close(relays?: string[]): void {
    let aditionalRelays = Array.from(this.getRelays())
      .filter(([relay]) => !this.inheritedRelays.includes(relay))
      .map(([relay]) => relay);

    if (relays) {
      aditionalRelays = aditionalRelays.filter(relay => relays.includes(relay));
    }

    super.close(aditionalRelays);
  }
}