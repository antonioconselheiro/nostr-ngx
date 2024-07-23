import { Routes } from '@angular/router';
import { PoolInteractComponent } from './pages/pool-interact/pool-interact.component';
import { NostrAuthCheckComponent } from './pages/nostr-auth-check/nostr-auth-check.component';
import { PoolConfigComponent } from './pages/pool-config/pool-config.component';

export const routes: Routes = [
  {
    path: 'pool-config',
    component: PoolConfigComponent
  },
  
  {
    path: 'pool-interact',
    component: PoolInteractComponent
  },

  {
    path: 'nostr-auth',
    component: NostrAuthCheckComponent
  }
];
