import { Component } from '@angular/core';
import { CredentialHandlerService } from '@belomonte/nostr-credential-ngx';

@Component({
  selector: 'app-nostr-auth-check',
  templateUrl: './nostr-auth-check.component.html',
  styleUrl: './nostr-auth-check.component.scss'
})
export class NostrAuthCheckComponent {

  constructor(
    private credentialHandlerService: CredentialHandlerService
  ) { }

  openAuthModal(): void {
    this.credentialHandlerService.handle();
  }
}
