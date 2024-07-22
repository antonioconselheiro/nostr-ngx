import { AbstractRelay } from 'nostr-tools/relay';
import { SmartPool } from './smart.pool';

/**
 * A extended pool that should not be able to close relays from father pool,
 * but can use it's connections.
 * 
 * This pool will reuse ALL active connections from a father pool and will
 * able to have it customs connections. It'll be not able to close inherited
 * relays.
 * 
 * If you don't want to connect in all inherited relays, but reuse connections,
 * you should use DerviatedSimplePool.
 */
export class ExtendedPool extends SmartPool {

  constructor(fatherPool: SmartPool) {
    super();

    const featherRelaysMap = this.getFatherRelaysMap(fatherPool);
    const poolRelaysReference = this.getPoolRelays();
    Object.keys(fatherPool.relays).forEach(url => {
      const inheritedConnection = featherRelaysMap.get(url);
      if (inheritedConnection) {
        this.relays[url] = { inherited: true, ...fatherPool.relays[url] };
        poolRelaysReference.set(url, inheritedConnection);
      }
    }); 
  }

  private getFatherRelaysMap(fatherPool: SmartPool): Map<string, AbstractRelay> {
    return (fatherPool as any).pool.relays;
  }
}