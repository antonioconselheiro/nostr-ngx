import { SimplePool } from 'nostr-tools';
import { AbstractRelay } from 'nostr-tools/relay';

export abstract class AbstractPool extends SimplePool {

  protected initRelays(): void {
    (this as any).relays = new Map();
  }

  protected addRelay(relay: string, conn: AbstractRelay): void {
    (this as any).relays.set(relay, conn);
  }

  protected getRelays(): Map<string, AbstractRelay> {
    return (this as any).relays;
  }

  listConnectionStatus(): Map<string, boolean> {
    const map = new Map<string, boolean>();
    this.getRelays()
      .forEach((relay, url) => map.set(url, relay.connected));

    return map;
  }
}
