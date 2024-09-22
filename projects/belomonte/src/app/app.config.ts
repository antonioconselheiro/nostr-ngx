import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DefaultRouterMatcher } from '@belomonte/nostr-ngx';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};

DefaultRouterMatcher.setDefaultFallback({
  'ws://umbrel.local:4848': { read: true, write: true },
  'wss://cache2.primal.net/v1': { read: true, write: false }
});