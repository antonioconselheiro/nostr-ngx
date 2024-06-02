import { Component } from '@angular/core';
import { ModalService } from '@belomonte/async-modal-ngx'
import { ModalNostrCredentialComponent } from '@belomonte/nostr-credential-ngx';

@Component({
  selector: 'app-nostr-auth-check',
  templateUrl: './nostr-auth-check.component.html',
  styleUrl: './nostr-auth-check.component.scss'
})
export class NostrAuthCheckComponent {

  constructor(
    private modalService: ModalService
  ){ }

  openAuthModal() {
    this.modalService
      .createModal(ModalNostrCredentialComponent)
      .build();
  }
}
