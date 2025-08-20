
import { verifyEvent as _verifyEvent, getFilterLimit, matchFilters, NostrEvent } from 'nostr-tools';
import { ArrayQueue, Backoff, ExponentialBackoff, Websocket, WebsocketBuilder, WebsocketEvent } from 'websocket-ts';
import { NostrEventWithOrigins } from '../event/nostr-event-with-origins.interface';
import { RelayDomainString } from '../event/relay-domain-string.type';
import { NostrClientMessage, NostrClientREQ } from './nostr-client-message.type';
import { NostrFilter } from './nostr-filter.type';
import { NostrRelayCLOSED, NostrRelayCOUNT, NostrRelayEOSE, NostrRelayEVENT, NostrRelayNOTICE, NostrRelayOK } from './nostr-relay-message.type';
import { NostrSet } from './nostr-set.type';
import { NostrStore } from './nostr-store.type';
import { PoolAsyncIterable } from './pool.async-iterable';

type EventMap = {
  [k: `ok:${string}`]: NostrRelayOK;
  [k: `sub:${string}`]: NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED;
  [k: `count:${string}`]: NostrRelayCOUNT;
  notice: NostrRelayNOTICE;
};

export interface NRelay1Opts {
  /** Respond to `AUTH` challenges by producing a signed kind `22242` event. */
  auth?(challenge: string): Promise<NostrEvent>;
  /** Configure reconnection strategy, or set to `false` to disable. Default: `new ExponentialBackoff(1000)`. */
  backoff?: Backoff | false;
  /** Ensure the event is valid before returning it. Default: `nostrTools.verifyEvent`. */
  verifyEvent?(event: NostrEvent): boolean;
}

export class NostrRelay implements NostrStore {
  readonly connection: Websocket;

  private subscriptions = new Map<string, NostrClientREQ>();
  private eventTarget = new EventTarget();

  constructor(
    private relayUrl: RelayDomainString, 
    opts: NRelay1Opts = {}
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
      // eslint-disable-next-line complexity
      .onMessage((_ws, ev) => {
        //  FIXME: cast data in a safe way
        const result = JSON.parse(ev.data)
        if (!result.success) return;
        const msg = result.data;
        switch (msg[0]) {
          case 'EVENT':
          case 'EOSE':
          case 'CLOSED':
            if (msg[0] === 'EVENT' && !verifyEvent(msg[2])) break;
            if (msg[0] === 'CLOSED') this.subscriptions.delete(msg[1]);
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

  protected send(msg: NostrClientMessage): void {
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
    opts: { signal?: AbortSignal } = {},
  ): AsyncGenerator<NostrRelayEVENT | NostrRelayEOSE | NostrRelayCLOSED> {
    const { signal } = opts;
    const subscriptionId = crypto.randomUUID();

    const msgs = this.on(`sub:${subscriptionId}`, signal);
    const req: NostrClientREQ = ['REQ', subscriptionId, ...filters];

    this.send(req);

    try {
      for await (const msg of msgs) {
        if (msg[0] === 'EOSE') yield msg;
        if (msg[0] === 'CLOSED') break;
        if (msg[0] === 'EVENT') {
          if (matchFilters(filters, msg[2])) {
            yield msg;
          } else {
            continue;
          }
        }
      }
    } finally {
      this.send(['CLOSE', subscriptionId]);
    }
  }

  async query(filters: NostrFilter[], opts?: { signal?: AbortSignal }): Promise<NostrEventWithOrigins[]> {
    const events = new NostrSet();

    const limit = filters.reduce((result, filter) => result + getFilterLimit(filter), 0);
    if (limit === 0) return [];

    for await (const msg of this.req(filters, opts)) {
      if (msg[0] === 'EOSE')
        break;
      if (msg[0] === 'EVENT')
        events.add({ event: msg[2], origin: [this.relayUrl] });
      if (msg[0] === 'CLOSED')
        throw new Error('Subscription closed');

      if (events.size >= limit) {
        break;
      }
    }

    return [...events];
  }

  async event(event: NostrEvent, opts?: { signal?: AbortSignal }): Promise<void> {
    //  FIXME: garantir que o evento seja publicado nos relays descritos
    const result = this.once(`ok:${event.id}`, opts?.signal);

    this.send(['EVENT', event]);

    const [, , ok, reason] = await result;

    if (!ok) {
      throw new Error(reason);
    }
  }

  async count(
    filters: NostrFilter[],
    opts?: { signal?: AbortSignal },
  ): Promise<{ count: number; approximate?: boolean }> {
    const subscriptionId = crypto.randomUUID();
    const result = this.once(`count:${subscriptionId}`, opts?.signal);

    this.send(['COUNT', subscriptionId, ...filters]);

    const [, , count] = await result;
    return count;
  }

  private async *on<K extends keyof EventMap>(key: K, signal?: AbortSignal): AsyncIterable<EventMap[K]> {
    if (signal?.aborted) throw this.abortError();

    const machina = new PoolAsyncIterable<EventMap[K]>(signal);
    const onMsg = (e: Event): void => machina.push((e as CustomEvent<EventMap[K]>).detail);

    this.eventTarget.addEventListener(key, onMsg);

    try {
      for await (const msg of machina) {
        yield msg;
      }
    } finally {
      this.eventTarget.removeEventListener(key, onMsg);
    }
  }

  private async once<K extends keyof EventMap>(key: K, signal?: AbortSignal): Promise<EventMap[K]> {
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
