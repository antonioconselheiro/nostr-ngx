import { SimplePool } from 'nostr-tools';

export abstract class AbstractPool extends SimplePool {

  listConnectionStatus(): Map<string, boolean> {
    const map = new Map<string, boolean>();
    this.relays
      .forEach((relay, url) => map.set(url, relay.connected));

    return map;
  }

  destroy(): void {
    this.relays.forEach(conn => conn.close());
    this.relays = new Map();
  }
}
