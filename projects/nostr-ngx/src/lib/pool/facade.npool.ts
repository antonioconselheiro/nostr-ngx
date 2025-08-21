import { NostrEventWithOrigins } from '../domain/event/nostr-event-with-origins.interface';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';
import { NostrEventAsyncIterable } from '../domain/nostrify/nostr-event.async-iterable';
import { NostrFilter } from '../domain/nostrify/nostr-filter.type';
import { NostrPool } from '../domain/nostrify/nostr-pool';
import { NostrRelayCLOSED, NostrRelayEOSE, NostrRelayEVENT } from '../domain/nostrify/nostr-relay-message.type';
import { NostrSet } from '../domain/nostrify/nostr-set.type';
import { NostrCache } from '../injection-token/nostr-cache.interface';
import { PoolRequestOptions } from './pool-request.options';
import { PoolRouterOptions } from './pool-router.options';

//  TODO: incluir mecânica de COUNT personalizada que dê suporte a tratamento de erros para versões que não suportam
//  NIP45 e respondem com NOTICE o filtro de COUNT ao invés de CLOSED: https://github.com/soapbox-pub/nostrify/issues/3

/**
 * controls the relation between main npool and the cache system (provided ncache and nstore)
 */
export class FacadeNPool extends NostrPool {

  constructor(
    private opts: PoolRouterOptions,

    /**
     * the main cache
     */
    protected readonly nostrCache: NostrCache
  ) {
    super(opts);
  }

  override async *req(
    filters: NostrFilter[],
    opts?: PoolRequestOptions,
  ): AsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    const controller = new AbortController();

    const routes = await this.opts.reqRouter(filters, opts);
    const poolIterable = new NostrEventAsyncIterable<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED>(controller.signal);

    const eoses = new Set<RelayDomainString>();
    const closes = new Set<RelayDomainString>();

    for (const url of routes.keys()) {
      const relay = this.relay(url);
      (async () => {
        for await (const msg of relay.req(filters, { signal: })) {
          if (msg[0] === 'EOSE') {
            eoses.add(url);
            if (eoses.size === routes.size) {
              poolIterable.push(msg);
            }
          }
          if (msg[0] === 'CLOSED') {
            closes.add(url);
            if (closes.size === routes.size) {
              poolIterable.push(msg);
            }
          }
          if (msg[0] === 'EVENT') {
            poolIterable.push(msg);
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      })().catch(() => {});
    }

    try {
      for await (const msg of poolIterable) {
        yield msg;
      }
    } finally {
      controller.abort();
    }
  }

  override async event(event: NostrEventWithOrigins, opts?: PoolRequestOptions): Promise<void> {
    const relayUrls = await this.getOpts().eventRouter(event, opts);

    await Promise.any(
      relayUrls.map((url) => this.relay(url).event(event, opts))
    );
  }

  override async query(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<NostrEventWithOrigins[]> {
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
        const nset = new NostrSet();
        memoryCacheResults.forEach(result => nset.add(result));

        const poolResults = await super.query(filters, opts);
        poolResults.forEach(result => nset.add(result));

        results = Array.from(nset);
      }

      return Promise.resolve(results.map(event => event));
    } else {
      const result = await Promise.all([
        this.nostrCache.query(filters),
        super.query(filters, opts),
      ]);

      return result.flat(2).map(event => event);
    }
  }
}