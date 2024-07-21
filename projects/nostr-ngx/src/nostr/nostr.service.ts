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
    definitiveRelays: string[]
  } {
    if (definitivePool instanceof Array) {
      return {
        definitivePool: MainPoolStatefull.currentPool,
        definitiveRelays: definitivePool
      };
    }

    if (!definitivePool) {
      definitivePool = MainPoolStatefull.currentPool;
    } else if (!(definitivePool instanceof AbstractSimplePool)) {
      if (operation === this.READ) {
        definitiveRelays = this.relayConfigService.filterReadableRelays(definitivePool)
      } else {
        definitiveRelays = this.relayConfigService.filterWritableRelays(definitivePool)
      }

      return {
        definitivePool: MainPoolStatefull.currentPool,
        definitiveRelays
      };
    }

    if (!definitiveRelays) {
      definitiveRelays = (definitivePool as any).relays as string[];
    } else if (!(definitiveRelays instanceof Array)) {
      if (operation === this.READ) {
        definitiveRelays = this.relayConfigService.filterReadableRelays(definitiveRelays)
      } else {
        definitiveRelays = this.relayConfigService.filterWritableRelays(definitiveRelays)
      }
    }

    return {
      definitivePool,
      definitiveRelays
    }
  }

  async request(
    filters: Filter[]
  ): Promise<Array<NostrEvent>>;
  async request(
    filters: Filter[],
    relays: TRelayMetadataRecord | string[]
  ): Promise<Array<NostrEvent>>;
  async request(
    filters: Filter[],

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool: AbstractSimplePool
  ): Promise<Array<NostrEvent>>;
  async request(
    filters: Filter[],

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool: AbstractSimplePool,
    relays: TRelayMetadataRecord | string[]
  ): Promise<Array<NostrEvent>>;
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
    filters: Filter[]
  ): Observable<NostrEvent>;
  observable(
    filters: Filter[],

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool: AbstractSimplePool
  ): Observable<NostrEvent>;
  observable(
    filters: Filter[],
    relays: TRelayMetadataRecord | string[]
  ): Observable<NostrEvent>;
  observable(
    filters: Filter[],

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool: AbstractSimplePool,
    relays: TRelayMetadataRecord | string[]
  ): Observable<NostrEvent>;
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
    event: NostrEvent
  ): Promise<void>;
  async publish(
    event: NostrEvent,

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool: AbstractSimplePool
  ): Promise<void>;
  async publish(
    event: NostrEvent,
    relays: TRelayMetadataRecord | string[]
  ): Promise<void>;
  async publish(
    event: NostrEvent,

    /**
     * @defaults MainPoolStatefull.currentPool
     */
    pool: AbstractSimplePool,
    relays: TRelayMetadataRecord | string[]
  ): Promise<void>;
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
