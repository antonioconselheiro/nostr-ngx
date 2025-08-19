import { getFilterLimit } from 'nostr-tools';
import { NostrEventWithOrigins } from '../event/nostr-event-with-origins.interface';
import { PoolRouterOptions } from '../../pool/pool-router.options';
import { RelayDomainString } from '../event/relay-domain-string.type';
import { PoolAsyncIterable } from './pool.async-iterable';
import { NostrFilter } from './nostr-filter.type';
import { NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from './nostr-relay-message.type';
import { NostrSet } from './nostr-set.type';
import { NRelay } from './nrelay';
import { NostrStore } from './nostr-store.type';
import { NostrRelay } from './nostr-relay';

/**
 * The `NPool` class is a `NRelay` implementation for connecting to multiple relays.
 *
 * ```ts
 * const pool = new NPool({
 *   open: (url) => new NRelay1(url),
 *   reqRouter: async (filters) => new Map([
 *     ['wss://relay1.mostr.pub', filters],
 *     ['wss://relay2.mostr.pub', filters],
 *   ]),
 *   eventRouter: async (event) => ['wss://relay1.mostr.pub', 'wss://relay2.mostr.pub'],
 * });
 *
 * // Now you can use the pool like a regular relay.
 * for await (const msg of pool.req([{ kinds: [1] }])) {
 *   if (msg[0] === 'EVENT') console.log(msg[2]);
 *   if (msg[0] === 'EOSE') break;
 * }
 * ```
 *
 * This class is designed with the Outbox model in mind.
 * Instead of passing relay URLs into each method, you pass functions into the contructor that statically-analyze filters and events to determine which relays to use for requesting and publishing events.
 * If a relay wasn't already connected, it will be opened automatically.
 * Defining `open` will also let you use any relay implementation, such as `NRelay1`.
 *
 * Note that `pool.req` may stream duplicate events, while `pool.query` will correctly process replaceable events and deletions within the event set before returning them.
 *
 * `pool.req` will only emit an `EOSE` when all relays in its set have emitted an `EOSE`, and likewise for `CLOSED`.
 */
export class NostrPool implements NostrStore {
  
  /**
   * Events are **regular**, which means they're all expected to be stored by relays.
   **/
  static regular(kind: number): boolean {
    return (1000 <= kind && kind < 10000) || [1, 2, 4, 5, 6, 7, 8, 16, 40, 41, 42, 43, 44].includes(kind);
  }

  /**
   * Events are **replaceable**, which means that, for each combination of `pubkey` and `kind`,
   * only the latest event is expected to (SHOULD) be stored by relays, older versions are
   * expected to be discarded.
   **/
  static replaceable(kind: number): boolean {
    return (10000 <= kind && kind < 20000) || [0, 3].includes(kind);
  }

  /**
   * Events are **ephemeral**, which means they are not expected to be stored by relays.
   **/
  static ephemeral(kind: number): boolean {
    return 20000 <= kind && kind < 30000;
  }

  /**
   * Events are **parameterized replaceable**, which means that, for each combination of
   * `pubkey`, `kind` and the `d` tag, only the latest event is expected to be stored by
   * relays, older versions are expected to be discarded.
   **/
  static parameterizedReplaceable(kind: number): boolean {
    return 30000 <= kind && kind < 40000;
  }
  
  private relays = new Map<RelayDomainString, NRelay>();

  constructor(private opts: PoolRouterOptions) {}

  /** Get or create a relay instance for the given URL. */
  relay(url: RelayDomainString): NRelay {
    const relay = this.relays.get(url);

    if (relay) {
      return relay;
    } else {
      const relay = new NostrRelay(url);
      this.relays.set(url, relay);
      return relay;
    }
  }

  async *req(
    filters: NostrFilter[],
    opts?: { signal?: AbortSignal },
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    const controller = new AbortController();
    const signal = opts?.signal ? AbortSignal.any([opts.signal, controller.signal]) : controller.signal;

    const routes = await this.opts.reqRouter(filters);
    if (routes.size < 1) {
      return;
    }
    const machina = new PoolAsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED>(signal);

    const eoses = new Set<RelayDomainString>();
    const closes = new Set<RelayDomainString>();

    for (const url of routes.keys()) {
      const relay = this.relay(url);
      (async () => {
        for await (const msg of relay.req(filters, { signal })) {
          if (msg[0] === 'EOSE') {
            eoses.add(url);
            if (eoses.size === routes.size) {
              machina.push(msg);
            }
          }
          if (msg[0] === 'CLOSED') {
            closes.add(url);
            if (closes.size === routes.size) {
              machina.push(msg);
            }
          }
          if (msg[0] === 'EVENT') {
            machina.push(msg);
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      })().catch(() => {});
    }

    try {
      for await (const msg of machina) {
        yield msg;
      }
    } finally {
      controller.abort();
    }
  }

  async event(event: NostrEventWithOrigins, opts?: { signal?: AbortSignal }): Promise<void> {
    const relayUrls = await this.opts.eventRouter(event);
    if (relayUrls.length < 1) {
      return;
    }

    await Promise.any(
      relayUrls.map((url) => this.relay(url).event(event, opts)),
    );
  }

  async query(filters: NostrFilter[], opts?: { signal?: AbortSignal }): Promise<NostrEventWithOrigins[]> {
    const events = new NostrSet();

    const limit = filters.reduce((result, filter) => result + getFilterLimit(filter), 0);
    if (limit === 0) return [];

    const replaceable = filters.reduce((result, filter) => {
      return result || !!filter.kinds?.some((k) => NostrPool.replaceable(k) || NostrPool.parameterizedReplaceable(k));
    }, false);

    try {
      for await (const msg of this.req(filters, opts)) {
        if (msg[0] === 'EOSE') break;
        //  FIXME: refatorar incluindo origin
        if (msg[0] === 'EVENT') events.add({ event: msg[2], origin: [] });
        if (msg[0] === 'CLOSED') throw new Error('Subscription closed');

        if (!replaceable && (events.size >= limit)) {
          break;
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Skip errors, return partial results.
    }

    return [...events];
  }
}
