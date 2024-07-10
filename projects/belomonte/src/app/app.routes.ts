import { Routes } from '@angular/router';
import { RelayCommunicationCheckComponent } from './pages/relay-communication-check/relay-communication-check.component';
import { NostrAuthCheckComponent } from './pages/nostr-auth-check/nostr-auth-check.component';
import { PoolCommunicationCheckComponent } from './pages/pool-communication-check/pool-communication-check.component';

export const routes: Routes = [
  {
    path: 'relay-communication',
    component: RelayCommunicationCheckComponent
  },

  {
    path: 'pool-communication',
    component: PoolCommunicationCheckComponent
  },

  {
    path: 'nostr-auth',
    component: NostrAuthCheckComponent
  }
];
