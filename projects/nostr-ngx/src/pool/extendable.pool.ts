import { SimplePool } from 'nostr-tools/pool';
import { AbstractRelay } from 'nostr-tools/relay';

export class ExtendablePool extends SimplePool {
  getRelays(): Map<string, AbstractRelay> {
    return this.relays;
  }

  resetRelays(): void {
    this.relays = new Map<string, AbstractRelay>();
  }
}