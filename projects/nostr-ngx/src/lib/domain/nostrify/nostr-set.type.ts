import { LRUCache } from "lru-cache";
import { kinds } from "nostr-tools";
import { NostrEventWithOrigins } from "../event/nostr-event-with-origins.interface";
import { NostrEvent } from "../event/nostr-event.interface";
import { HexString } from "../event/primitive/hex-string.type";

export class NostrSet {

  /** Event kind is **replaceable**, which means that, for each combination of `pubkey` and `kind`, only the latest event is expected to (SHOULD) be stored by relays, older versions are expected to be discarded. */
  protected static isReplaceable(kind: number): boolean {
    return [0, 3].includes(kind) || (10000 <= kind && kind < 20000);
  }

  /** Event kind is **parameterized replaceable**, which means that, for each combination of `pubkey`, `kind` and the `d` tag, only the latest event is expected to be stored by relays, older versions are expected to be discarded. */
  protected static isParameterizedReplaceable(kind: number): boolean {
    return 30000 <= kind && kind < 40000;
  }

  /**
   * Returns true if `event` replaces `target`.
   *
   * Both events must be replaceable, belong to the same kind and pubkey (and `d` tag, for parameterized events), and the `event` must be newer than the `target`.
   */
  // eslint-disable-next-line complexity
  protected static replaces(event: NostrEvent, target: NostrEvent): boolean {
    const { kind, pubkey } = event;

    if (NostrSet.isReplaceable(kind)) {
      return kind === target.kind && pubkey === target.pubkey && event.created_at >= target.created_at;
    }

    if (NostrSet.isParameterizedReplaceable(kind)) {
      const d1 = event.tags.find(([name]) => name === 'd')?.[1] || '';
      const d2 = target.tags.find(([name]) => name === 'd')?.[1] || '';

      return kind === target.kind &&
        pubkey === target.pubkey &&
        event.created_at >= target.created_at &&
        d1 === d2;
    }

    return false;
  }

  /**
   * Returns true if the `event` deletes`target`.
   *
   * `event` must be a kind `5` event, and both events must share the same `pubkey`.
   */
  protected static deletes(deletionEvent: NostrEvent, target: NostrEvent): boolean {
    const { kind, pubkey, tags } = deletionEvent;
    if (kind === kinds.EventDeletion && pubkey === target.pubkey) {
      for (const [name, value] of tags) {
        if (name === 'e' && value === target.id) {
          return true;
        }
      }
    }
    return false;
  }

  constructor(
    protected cache: LRUCache<HexString, NostrEventWithOrigins> | Map<HexString, NostrEventWithOrigins> = new Map()
  ) { }

  get size(): number {
    return this.cache.size;
  }

  add(origins: NostrEventWithOrigins): this {
    this.#processDeletions(origins.event);

    for (const o of this) {
      if (NostrSet.deletes(o.event, origins.event) || NostrSet.replaces(o.event, origins.event)) {
        return this;
      } else if (NostrSet.replaces(origins.event, o.event)) {
        this.delete(o.event.id);
      }
    }

    this.cache.set(origins.event.id, origins);
    return this;
  }

  #processDeletions(event: NostrEvent): void {
    if (event.kind === kinds.EventDeletion) {
      for (const tag of event.tags) {
        if (tag[0] === 'e') {
          const e = this.cache.get(tag[1]);
          if (e && e.event.pubkey === event.pubkey) {
            this.delete(e.event.id);
          }
        }
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  delete(eventId: HexString): boolean {
    return this.cache.delete(eventId);
  }

  forEach(callbackfn: (resultset: NostrEventWithOrigins, key: NostrEventWithOrigins, set: typeof this) => void, thisArg?: any): void {
    return this.cache.forEach(event => callbackfn(event, event, this), thisArg);
  }

  has(resultset: NostrEventWithOrigins): boolean {
    return this.cache.has(resultset.event.id);
  }

  *entries(): IterableIterator<[NostrEventWithOrigins, NostrEventWithOrigins]> {
    for (const event of this.values()) {
      yield [event, event];
    }
  }

  keys(): IterableIterator<NostrEventWithOrigins> {
    return this.values();
  }

  *values(): IterableIterator<NostrEventWithOrigins> {
    for (const event of this.cache.values()) {
      yield event;
    }
  }

  [Symbol.iterator](): IterableIterator<NostrEventWithOrigins> {
    return this.values();
  }

  [Symbol.toStringTag] = 'NSet';
}
