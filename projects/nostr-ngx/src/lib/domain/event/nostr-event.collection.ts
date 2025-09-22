import { LRUCache } from "lru-cache";
import { kinds } from "nostr-tools";
import { NostrEventWithRelays } from "./nostr-event-with-relays.interface";
import { NostrEvent } from "./nostr-event.interface";
import { HexString } from "./primitive/hex-string.type";

export class NostrEventCollection {

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
  protected static replaces(event: NostrEvent, target: NostrEvent): boolean {
    const { kind, pubkey } = event;

    if (NostrEventCollection.isReplaceable(kind)) {
      return kind === target.kind && pubkey === target.pubkey && event.created_at >= target.created_at;
    }

    if (NostrEventCollection.isParameterizedReplaceable(kind)) {
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
    protected store: LRUCache<HexString, NostrEventWithRelays> | Map<HexString, NostrEventWithRelays> = new Map()
  ) { }

  get size(): number {
    return this.store.size;
  }

  add(withRelays: NostrEventWithRelays): this {
    this.#processDeletions(withRelays.event);

    for (const item of this) {
      if (NostrEventCollection.deletes(item.event, withRelays.event) || NostrEventCollection.replaces(item.event, withRelays.event)) {
        return this;
      } else if (NostrEventCollection.replaces(withRelays.event, item.event)) {
        this.delete(item.event.id);
      }
    }

    this.store.set(withRelays.event.id, withRelays);
    return this;
  }

  #processDeletions(event: NostrEvent): void {
    if (event.kind === kinds.EventDeletion) {
      for (const tag of event.tags) {
        if (tag[0] === 'e') {
          const e = this.store.get(tag[1]);
          if (e && e.event.pubkey === event.pubkey) {
            this.delete(e.event.id);
          }
        }
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  delete(eventId: HexString): boolean {
    return this.store.delete(eventId);
  }

  forEach(callbackfn: (resultset: NostrEventWithRelays, key: NostrEventWithRelays, set: typeof this) => void, thisArg?: any): void {
    return this.store.forEach(event => callbackfn(event, event, this), thisArg);
  }

  has(resultset: NostrEventWithRelays): boolean {
    return this.store.has(resultset.event.id);
  }

  get(idEvent: HexString): NostrEventWithRelays | null {
    return this.store.get(idEvent) || null;
  }

  *entries(): IterableIterator<[NostrEventWithRelays, NostrEventWithRelays]> {
    for (const event of this.values()) {
      yield [event, event];
    }
  }

  keys(): IterableIterator<NostrEventWithRelays> {
    return this.values();
  }

  *values(): IterableIterator<NostrEventWithRelays> {
    for (const event of this.store.values()) {
      yield event;
    }
  }

  [Symbol.iterator](): IterableIterator<NostrEventWithRelays> {
    return this.values();
  }

  [Symbol.toStringTag] = 'NostrEventCollection';
}
