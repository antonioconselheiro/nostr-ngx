import { Routes } from '@angular/router';
import { RelayCommunicationCheckComponent } from './shared/relay-communication-check/relay-communication-check.component';
import { NostrAuthCheckComponent } from './shared/nostr-auth-check/nostr-auth-check.component';

export const routes: Routes = [
  {
    path: 'relay-communication',
    component: RelayCommunicationCheckComponent
  },

  {
    path: 'nostr-auth',
    component: NostrAuthCheckComponent
  }
];
