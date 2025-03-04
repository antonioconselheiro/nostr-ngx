import { NostrFilter, NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT, NPool, NSet } from '@nostrify/nostrify';
import { Machina } from '@nostrify/nostrify/utils';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { NostrCache } from '../injection-token/nostr-cache.interface';
import { NPoolRequestOptions } from './npool-request.options';
import { NpoolRouterOptions } from './npool-router.options';

//  TODO: incluir mecânica de COUNT personalizada que dê suporte a tratamento de erros para versões que não suportam
//  NIP45 e respondem com NOTICE o filtro de COUNT ao invés de CLOSED: https://github.com/soapbox-pub/nostrify/issues/3

/**
 * controls the relation between main npool and the cache system (provided ncache and nstore)
 */
export class FacadeNPool extends NPool {

  constructor(
    opts: NpoolRouterOptions,

    /**
     * the main cache
     */
    protected readonly nostrCache: NostrCache
  ) {
    super(opts);
  }

  override async *req(
    filters: NostrFilter[],
    opts?: NPoolRequestOptions,
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    const controller = new AbortController();
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

  override async query(filters: NostrFilter[], opts?: NPoolRequestOptions): Promise<NostrEvent[]> {
    let limit: number | false = false;
    //  TODO: se o filtro tiver ids a quantidade de ids deve ser considera como limit
    //  FIXME: validar calculo do limite
    const limits = filters.map(filter => filter.limit || null);
    limit = limits.find(() => null) ? false : limits.reduce(
      (accumulator, currentValue) =>  (accumulator || 0) + (currentValue || 0),
    0) || false;

    if (limit) {
      const memoryCacheResults = await this.nostrCache.query(filters);
      let results = memoryCacheResults;
      if (memoryCacheResults.length < limit) {
        const nset = new NSet();
        memoryCacheResults.forEach(result => nset.add(result));

        const poolResults = await super.query(filters, opts);
        poolResults.forEach(result => nset.add(result));

        results = Array.from(nset);
      }

      return Promise.resolve(results);
    } else {
      const result = await Promise.all([
        this.nostrCache.query(filters),
        super.query(filters, opts),
      ]);
      
      return result.flat(2)
    }
  }

  protected getOpts(): NpoolRouterOptions {
    //  u____u nobody need know, keep scrolling
    return (this as any as { opts: NpoolRouterOptions }).opts;
  }
}