import { Injectable } from '@angular/core';
import { Filter, NostrEvent } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/pool';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MainPoolStatefull } from './main-pool.statefull';
import { TRelayMetadataRecord } from '../domain/relay-metadata.record';
import { RelayConfigService } from './relay-config.service';

/**
 * Interacts with pool relays, request data, subscribe filters and publish content
 */
@Injectable({
  providedIn: 'root'
})
export class NostrService {

  private readonly READ = 0;
  private readonly WRITE = 1; 

  constructor(
    private relayConfigService: RelayConfigService
  ) {}

  private getPoolAndRelays(
    operation: NostrService['READ'] | NostrService['WRITE'],
    definitivePool?: AbstractSimplePool | TRelayMetadataRecord | string[],
    definitiveRelays?: TRelayMetadataRecord | string[]
  ): {
    definitivePool: AbstractSimplePool,
    definitiveRelays: TRelayMetadataRecord
  } {
    if (definitivePool instanceof Array) {
      const record: TRelayMetadataRecord = {};
      definitivePool
        .forEach(url => record[url] = { url, write: true, read: true });

      return {
        definitivePool: MainPoolStatefull.currentPool,
        definitiveRelays: record
      };
    }

    if (definitivePool && !(definitivePool instanceof AbstractSimplePool)) {
      return {
        definitivePool: MainPoolStatefull.currentPool,
        definitiveRelays: definitivePool
      };
    } else if (!definitivePool) {
      definitivePool = MainPoolStatefull.currentPool;
    }

    return {
      definitivePool, definitiveRelays: definitiveRelays ? (definitivePool as any).relays : definitiveRelays
    }
  }

  async request(
    filters: Filter[],
    pool?: AbstractSimplePool | TRelayMetadataRecord | string[],
    relays?: TRelayMetadataRecord | string[]
  ): Promise<Array<NostrEvent>> {
    const events = new Array<NostrEvent>();
    const { definitivePool, definitiveRelays } = this.getPoolAndRelays(this.READ, pool, relays);
    const readRelays = this.relayConfigService.filterReadableRelays(definitiveRelays);
    console.debug('requesting in pool:', definitivePool, 'using relays:', readRelays, 'filters: ', filters);

    return new Promise(resolve => {
      const subscription = definitivePool.subscribeMany(readRelays, filters, {
        onevent: event => {
          console.debug('[onevent]', event);
          events.push(event);
        },
        onclose(reasons): void {
          console.debug('[onclose]', reasons);
        },
        oneose(): void {
          console.debug('[eose]', events);
          subscription.close();
          resolve(events);
        }
      });
    });
  }

  observable(
    filters: Filter[],
    pool?: AbstractSimplePool | TRelayMetadataRecord | string[],
    relays?: TRelayMetadataRecord | string[]
  ): Observable<NostrEvent> {
    const { definitivePool, definitiveRelays } = this.getPoolAndRelays(this.READ, pool, relays);
    const readRelays = this.relayConfigService.filterReadableRelays(definitiveRelays);
    const subject = new Subject<NostrEvent>();
    const onDestroy$ = new Subject<void>();
    console.debug('subscribing in pool:', definitivePool, 'using relays:', readRelays, 'filters: ', filters);

    const poolSubscription = definitivePool.subscribeMany(
      readRelays, filters, {
      onevent: event => subject.next(event),
      oneose(): void { }
    });

    onDestroy$.subscribe(() => {
      poolSubscription.close();
      onDestroy$.unsubscribe();
    });

    return subject
      .asObservable()
      .pipe(takeUntil(onDestroy$));
  }

  async publish(
    event: NostrEvent,
    pool?: AbstractSimplePool | TRelayMetadataRecord | string[],
    relays?: TRelayMetadataRecord | string[]
  ): Promise<void> {
    const { definitivePool, definitiveRelays } = this.getPoolAndRelays(this.WRITE, pool, relays);
    const writeRelays = this.relayConfigService.filterReadableRelays(definitiveRelays);
    console.debug('publishing in pool:', definitivePool, 'using relays:', writeRelays, 'event: ', event);

    // TODO: pode ser útil tratar individualmente os retornos, de forma a identificar
    //  quais relays concluiram corretamente e quais responderam com erro e qual erro
    return Promise.all(
      definitivePool.publish(writeRelays, event)
    ).then(() => Promise.resolve());
  }
}
