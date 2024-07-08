import { SimplePool } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import { normalizeURL } from 'nostr-tools/utils';

export class ExtendedSimplePool extends SimplePool {

  private originalRelays: string[] = [];

  constructor(pool: AbstractSimplePool, relays: string[]) {
    super();

    //  TODO: iterar diretamente no entries
    Array.from(pool.seenOn.entries()).forEach(touple => {
      const [ key, value ] = touple;
      this.originalRelays.push(key);
      this.seenOn.set(key, value);
    });

    relays.forEach(relay => {
      const url = normalizeURL(relay);
      if (!this.originalRelays.includes(url)) {
        this.ensureRelay(url);
      }
    });   
  }

  override close(): void {
    const aditionalRelays = Array.from(this.seenOn.keys()).filter(relay => !this.originalRelays.includes(relay));
    super.close(aditionalRelays);
  }
}