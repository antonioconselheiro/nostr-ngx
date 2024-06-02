import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NostrAuthCheckModule } from './pages/nostr-auth-check/nostr-auth-check.module';
import { RelayCommunicationCheckModule } from './pages/relay-communication-check/relay-communication-check.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NostrAuthCheckModule,
    RelayCommunicationCheckModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
