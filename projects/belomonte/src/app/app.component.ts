import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NostrAuthCheckModule } from './pages/nostr-auth-check/nostr-auth-check.module';
import { PoolInteractModule } from './pages/pool-interact/pool-interact.module';
import { PoolConfigModule } from './pages/pool-config/pool-config.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NostrAuthCheckModule,
    PoolInteractModule,
    PoolConfigModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
