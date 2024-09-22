import { Component } from '@angular/core';
import { CredentialHandlerService } from '@belomonte/nostr-gui-ngx';

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
    this.credentialHandlerService.login();
  }

  openAddUser(): void {
    this.credentialHandlerService.addAccount();
  }

  openManageRelays(): void {
    this.credentialHandlerService.manageRelays();
  }

  openEditProfile(): void {
    this.credentialHandlerService.editProfile();
  }
}
