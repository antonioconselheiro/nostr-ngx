import { kinds } from "nostr-tools";
import { NostrEventOrigins } from "../event/nostr-event-origins.interface";

/**
 * Nostr event implementation of the `Set` interface.
 *
 * NSet is an implementation of the theory that a Nostr Storage is actually just a Set.
 * Events are Nostr's only data type, and they are immutable, making the Set interface ideal.
 *
 * ```ts
 * const events = new NSet();
 *
 * // Events can be added like a regular `Set`:
 * events.add(event1);
 * events.add(event2);
 *
 * // Can be iterated:
 * for (const event of events) {
 *   if (matchFilters(filters, event)) {
 *     console.log(event);
 *   }
 * }
 * ```
 *
 * `NSet` will handle kind `5` deletions, removing events from the set.
 * Replaceable (and parameterized) events will keep only the newest version.
 * However, verification of `id` and `sig` is NOT performed.
 *
 * Any `Map` instance can be passed into `new NSet()`, making it compatible with
 * [lru-cache](https://www.npmjs.com/package/lru-cache), among others.
 */
export class NostrSet implements Set<NostrEventOrigins> {
  protected cache: Map<string, NostrEventOrigins>;

  constructor(map?: Map<string, NostrEventOrigins>) {
    this.cache = map ?? new Map();
  }

  get size(): number {
    return this.cache.size;
  }

  add(resultset: NostrEventOrigins): this {
    this.#processDeletions(resultset);

    for (const e of this) {
      if (NostrSet.deletes(e, resultset) || NostrSet.replaces(e, resultset)) {
        return this;
      } else if (NostrSet.replaces(resultset, e)) {
        this.delete(e);
      }
    }

    this.cache.set(resultset.event.id, resultset);
    return this;
  }

  #processDeletions(resultset: NostrEventOrigins): void {
    if (resultset.event.kind === kinds.EventDeletion) {
      for (const tag of resultset.event.tags) {
        if (tag[0] === 'e') {
          const e = this.cache.get(tag[1]);
          if (e && e.event.pubkey === resultset.event.pubkey) {
            this.delete(e);
          }
        }
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  delete(resultset: NostrEventOrigins): boolean {
    return this.cache.delete(resultset.event.id);
  }

  forEach(callbackfn: (resultset: NostrEventOrigins, key: NostrEventOrigins, set: typeof this) => void, thisArg?: any): void {
    return this.cache.forEach(event => callbackfn(event, event, this), thisArg);
  }

  has(resultset: NostrEventOrigins): boolean {
    return this.cache.has(resultset.event.id);
  }

  *entries(): IterableIterator<[NostrEventOrigins, NostrEventOrigins]> {
    for (const event of this.values()) {
      yield [event, event];
    }
  }

  keys(): IterableIterator<NostrEventOrigins> {
    return this.values();
  }

  *values(): IterableIterator<NostrEventOrigins> {
    for (const event of NostrSet.sortEvents([...this.cache.values()])) {
      yield event;
    }
  }

  [Symbol.iterator](): IterableIterator<NostrEventOrigins> {
    return this.values();
  }

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
  protected static replaces(resultset: NostrEventOrigins, target: NostrEventOrigins): boolean {
    const { kind, pubkey } = resultset.event;

    if (NostrSet.isReplaceable(kind)) {
      return kind === target.event.kind && pubkey === target.event.pubkey && NostrSet.sortEvents([resultset, target])[0] === resultset;
    }

    if (NostrSet.isParameterizedReplaceable(kind)) {
      const d1 = resultset.event.tags.find(([name]) => name === 'd')?.[1] || '';
      const d2 = target.event.tags.find(([name]) => name === 'd')?.[1] || '';

      return kind === target.event.kind &&
        pubkey === target.event.pubkey &&
        NostrSet.sortEvents([resultset, target])[0] === resultset &&
        d1 === d2;
    }

    return false;
  }

  /**
   * Returns true if the `event` deletes`target`.
   *
   * `event` must be a kind `5` event, and both events must share the same `pubkey`.
   */
  protected static deletes(resultset: NostrEventOrigins, target: NostrEventOrigins): boolean {
    const { kind, pubkey, tags } = resultset.event;
    if (kind === kinds.EventDeletion && pubkey === target.event.pubkey) {
      for (const [name, value] of tags) {
        if (name === 'e' && value === target.event.id) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Sort events in reverse-chronological order by the `created_at` timestamp,
   * and then by the event `id` (lexicographically) in case of ties.
   * This mutates the array.
   */
  protected static sortEvents(events: NostrEventOrigins[]): NostrEventOrigins[] {
    return events.sort((a: NostrEventOrigins, b: NostrEventOrigins): number => {
      if (a.event.created_at !== b.event.created_at) {
        return b.event.created_at - a.event.created_at;
      }
      return a.event.id.localeCompare(b.event.id);
    });
  }

  [Symbol.toStringTag] = 'NSet';
}
