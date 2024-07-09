import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { PoolStatefull } from '@belomonte/nostr-ngx';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

PoolStatefull.setDefaultApplicationRelays({
  'ws://umbrel.local:4848': { url: 'ws://umbrel.local:4848', read: true, write: true },
  'wss://cache2.primal.net/v1': { url: 'wss://cache2.primal.net/v1', read: true, write: false },
  'wss://nos.lol': { url: 'wss://nos.lol', read: true, write: true },
  'wss://relay.damus.io': { url: 'wss://relay.damus.io', read: true, write: true },
  'wss://relay.primal.net': { url: 'wss://relay.primal.net', read: true, write: true },
  'wss://relay.snort.social': { url: 'wss://relay.snort.social', read: true, write: true },
  'wss://nostr-pub.wellorder.net': { url: 'wss://nostr-pub.wellorder.net', read: true, write: true },
  'wss://offchain.pub': { url: 'wss://offchain.pub', read: true, write: true },
  'wss://yabu.me': { url: 'wss://yabu.me', read: true, write: true },
  'wss://nostr.vulpem.com': { url: 'wss://nostr.vulpem.com', read: true, write: true },
  'wss://eden.nostr.land': { url: 'wss://eden.nostr.land', read: true, write: true },
  'wss://feeds.nostr.band': { url: 'wss://feeds.nostr.band', read: true, write: true },
  'wss://nostr.wine': { url: 'wss://nostr.wine', read: true, write: true },
  'wss://e.nos.lol': { url: 'wss://e.nos.lol', read: true, write: true },
  'wss://nostrue.com': { url: 'wss://nostrue.com', read: true, write: true },
  'wss://nostr.mom': { url: 'wss://nostr.mom', read: true, write: true },
  'wss://nostr.fmt.wiz.biz': { url: 'wss://nostr.fmt.wiz.biz', read: true, write: true },
  'wss://relay.nostrati.com': { url: 'wss://relay.nostrati.com', read: true, write: true },
  'wss://relay.nostr.com.au': { url: 'wss://relay.nostr.com.au', read: true, write: true },
  'wss://soloco.nl': { url: 'wss://soloco.nl', read: true, write: true }
});