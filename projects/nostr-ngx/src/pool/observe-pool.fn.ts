import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { AbstractRelay } from 'nostr-tools/relay';
import { Observable, Subject } from 'rxjs';
import { observeRelay } from './observe-relay.fn';

export function observePool(pool: AbstractSimplePool): {
  /**
   * on add relay, on close relay and when relay changes it connection status
   */
  changes: Observable<void>
} {
  const hasObserve = (pool as any)._observe;
  if (hasObserve) {
    return hasObserve;
  }

  const subject = new Subject<void>();
  const close = pool.close.bind(pool);
  const destroy = ((pool as any).destroy || function(){}).bind(pool);
  const ensureRelay = pool.ensureRelay.bind(pool);

  pool.close = (relays: string[]): void => {
    close(relays);
    subject.next();
  };

  pool.ensureRelay = async (
    url: string, params?: { connectionTimeout?: number; }
  ): Promise<AbstractRelay> => {
    const length = (pool as any).relays.size;
    const relay = await ensureRelay(url, params);

    if (length !== (pool as any).relays.size) {
      subject.next();
    }

    return Promise.resolve(relay);
  };

  (pool as any).destroy = () => {
    destroy();
    subject.next();
  };

  ((pool as any).relays as Array<AbstractRelay>).forEach(relay => {
    observeRelay(relay).connection.subscribe(() => subject.next())
  });

  return (pool as any)._observe = {
    changes: subject.asObservable()
  };
}
