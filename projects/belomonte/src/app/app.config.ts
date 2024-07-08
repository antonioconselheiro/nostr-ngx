import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { PoolStatefull } from '@belomonte/nostr-ngx';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

PoolStatefull.setDefaultApplicationRelays({
  'ws://umbrel.local:4848': { read: true, write: true },
  'wss://cache2.primal.net/v1': { read: true, write: false },
  'wss://nos.lol': { read: true, write: true },
  'wss://relay.damus.io': { read: true, write: true },
  'wss://relay.primal.net': { read: true, write: true },
  'wss://relay.snort.social': { read: true, write: true },
  'wss://nostr-pub.wellorder.net': { read: true, write: true },
  'wss://offchain.pub': { read: true, write: true },
  'wss://yabu.me': { read: true, write: true },
  'wss://nostr.vulpem.com': { read: true, write: true },
  'wss://eden.nostr.land': { read: true, write: true },
  'wss://feeds.nostr.band': { read: true, write: true },
  'wss://nostr.wine': { read: true, write: true },
  'wss://e.nos.lol': { read: true, write: true },
  'wss://nostrue.com': { read: true, write: true },
  'wss://nostr.mom': { read: true, write: true },
  'wss://nostr.fmt.wiz.biz': { read: true, write: true },
  'wss://relay.nostrati.com': { read: true, write: true },
  'wss://relay.nostr.com.au': { read: true, write: true },
  'wss://soloco.nl': { read: true, write: true }
});