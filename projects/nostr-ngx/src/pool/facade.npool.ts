import { NCache, NostrEvent, NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT, NPool, NStore } from '@nostrify/nostrify';
import { Machina } from '@nostrify/nostrify/utils';
import { NPoolRequestOptions } from './npool-request.options';
import { NpoolRouterOptions } from './npool-router.options';

/**
 * controls the relation between main npool and the cache system (provided ncache and nstore)
 */
export class FacadeNPool extends NPool {

  constructor(
    opts: NpoolRouterOptions,
    /**
     * I/O cache
     */
    protected readonly nstore: NStore,

    /**
     * in memory cache
     */
    protected readonly ncache: NCache
  ) {
    super(opts);
  }

  override async *req(
    filters: NostrFilter[],
    opts?: NPoolRequestOptions,
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    //  FIXME? the following code is a copy of npool code, with opts being send to reqRouter,
    //  I will remove this if this suggestion get accepted:
    //  https://github.com/soapbox-pub/nostrify/issues/2
    const controller = new AbortController();
    //  FIXME: AbortSignal.any is throwing build erro e__e
    const signal = opts?.signal ? (AbortSignal as any).any([opts.signal, controller.signal]) : controller.signal;

    const routes = await this.getOpts().reqRouter(filters, opts);
    const machina = new Machina<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED>(signal);

    const eoses = new Set<WebSocket['url']>();
    const closes = new Set<WebSocket['url']>();

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

  override async event(event: NostrEvent, opts?: NPoolRequestOptions): Promise<void> {
    const relayUrls = await this.getOpts().eventRouter(event, opts);

    await Promise.any(
      relayUrls.map((url) => this.relay(url).event(event, opts))
    );
  }

  override query(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<NostrEvent[]> {
    return super.query(filters, opts);
  }

  protected getOpts(): NpoolRouterOptions {
    //  u____u nobody need know, keep scrolling
    return (this as any as { opts: NpoolRouterOptions }).opts;
  }
}