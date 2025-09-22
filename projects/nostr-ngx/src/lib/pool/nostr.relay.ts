
import { verifyEvent as _verifyEvent, getFilterLimit, matchFilters, NostrEvent } from 'nostr-tools';
import { ArrayQueue, ExponentialBackoff, Websocket, WebsocketBuilder, WebsocketEvent } from 'websocket-ts';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrEventCollection } from '../domain/event/nostr-event.collection';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';
import { NostrRequest } from '../domain/request/nostr.request';
import { ReqRequest } from '../domain/request/req.request';
import { ClosedResultset } from '../domain/resultset/closed.resultset';
import { EoseResultset } from '../domain/resultset/eose.resultset';
import { EventWithRelaysResultset } from '../domain/resultset/event-with-relays.resultset';
import { ResultsetMap } from '../domain/resultset/resultset.map';
import { NostrEventIterable } from './nostr-event.iterable';
import { NostrFilter } from './nostr-filter.interface';
import { PoolRequestOptions } from './pool-request.options';
import { RelayOptions } from './relay.options';

export class NostrRelay {
  readonly connection: Websocket;

  private subscriptions = new Map<string, ReqRequest>();
  private eventTarget = new EventTarget();

  constructor(
    private relayUrl: RelayDomainString, 
    opts: RelayOptions = {}
  ) {
    const { auth, backoff = new ExponentialBackoff(1000), verifyEvent = _verifyEvent } = opts;

    this.connection = new WebsocketBuilder(relayUrl)
      .withBuffer(new ArrayQueue())
      .withBackoff(backoff === false ? undefined : backoff)
      .onOpen(() => {
        for (const req of this.subscriptions.values()) {
          this.send(req);
        }
      })
      .onMessage((_ws, ev) => {
        //  FIXME: cast data in a safe way
        const msg = JSON.parse(ev.data)

        switch (msg[0]) {
          case 'EVENT':
          case 'EOSE':
          case 'CLOSED':
            if (msg[0] === 'EVENT' && !verifyEvent(msg[2])) {
              break;
            } else if (msg[0] === 'CLOSED') {
              this.subscriptions.delete(msg[1]);
            }
            this.eventTarget.dispatchEvent(new CustomEvent(`sub:${msg[1]}`, { detail: msg }));
            break;
          case 'OK':
            this.eventTarget.dispatchEvent(new CustomEvent(`ok:${msg[1]}`, { detail: msg }));
            break;
          case 'NOTICE':
            this.eventTarget.dispatchEvent(new CustomEvent('notice', { detail: msg }));
            break;
          case 'COUNT':
            this.eventTarget.dispatchEvent(new CustomEvent(`count:${msg[1]}`, { detail: msg }));
            break;
          case 'AUTH':
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            auth?.(msg[1]).then((event) => this.send(['AUTH', event])).catch(() => {});
        }
      })
      .build();
  }

  protected send(msg: NostrRequest): void {
    switch (msg[0]) {
      case 'REQ':
        this.subscriptions.set(msg[1], msg);
        break;
      case 'CLOSE':
        this.subscriptions.delete(msg[1]);
        break;
      case 'EVENT':
      case 'COUNT':
        return this.connection.send(JSON.stringify(msg));
    }

    if (this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(JSON.stringify(msg));
    }
  }

  async *req(
    filters: NostrFilter[],
    opts: PoolRequestOptions = {},
  ): AsyncGenerator<EventWithRelaysResultset | EoseResultset | ClosedResultset> {
    const { signal } = opts;
    const subscriptionId = crypto.randomUUID();

    const msgs = this.on(`sub:${subscriptionId}`, signal);
    const req: ReqRequest = ['REQ', subscriptionId, ...filters];

    this.send(req);

    try {
      for await (const msg of msgs) {
        if (msg[0] === 'EOSE') {
          yield msg;
        } else if (msg[0] === 'CLOSED') {
          break;
        } else if (msg[0] === 'EVENT') {
          if (matchFilters(filters, msg[2])) {
            yield [ 'EVENT_WITH_RELAYS', msg[1], { event: msg[2], relays: [this.relayUrl] }];
          }
        }
      }
    } finally {
      this.send(['CLOSE', subscriptionId]);
    }
  }

  async query(filters: NostrFilter[], opts?: PoolRequestOptions): Promise<NostrEventWithRelays[]> {
    const events = new NostrEventCollection();

    const limit = filters.reduce((result, filter) => result + getFilterLimit(filter), 0);
    if (limit === 0) return [];

    try {
      for await (const msg of this.req(filters, opts)) {
        if (msg[0] === 'EOSE') {
          break;
        } else if (msg[0] === 'EVENT_WITH_RELAYS') {
          events.add(msg[2]);
        } else  if (msg[0] === 'CLOSED') {
          throw new Error('Subscription closed');
        } else if (events.size >= limit) {
          break;
        }
      }
    } catch {
      // Skip errors, return partial results.
    }

    return [...events];
  }

  async publish(event: NostrEvent, signal?: AbortSignal): Promise<void> {
    //  FIXME: garantir que o evento seja publicado nos relays descritos
    const result = this.once(`ok:${event.id}`, signal);

    this.send(['EVENT', event]);

    const [, , ok, reason] = await result;

    if (!ok) {
      return Promise.reject(new Error(reason));
    }
  }

  private async *on<K extends keyof ResultsetMap>(key: K, signal?: AbortSignal): AsyncIterable<ResultsetMap[K]> {
    if (signal?.aborted) {
      throw this.abortError();
    }

    const iterable = new NostrEventIterable<ResultsetMap[K]>(signal);
    const onMessage = (e: Event): void => iterable.push((e as CustomEvent<ResultsetMap[K]>).detail);

    this.eventTarget.addEventListener(key, onMessage);

    try {
      for await (const msg of iterable) {
        yield msg;
      }
    } finally {
      this.eventTarget.removeEventListener(key, onMessage);
    }
  }

  private async once<K extends keyof ResultsetMap>(key: K, signal?: AbortSignal): Promise<ResultsetMap[K]> {
    for await (const msg of this.on(key, signal)) {
      return msg;
    }
    throw new Error('Unreachable');
  }

  protected abortError(): DOMException {
    return new DOMException('The signal has been aborted', 'AbortError');
  }

  async close(): Promise<void> {
    if (this.connection.readyState === WebSocket.CLOSED) return;
    await new Promise((resolve) => {
      this.connection.addEventListener(WebsocketEvent.close, resolve, { once: true });
      this.connection.close();
    });
  }
}
