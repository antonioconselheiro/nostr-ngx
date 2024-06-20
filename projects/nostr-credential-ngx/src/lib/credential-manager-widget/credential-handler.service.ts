import { Injectable } from '@angular/core';
import { ModalService } from '@belomonte/async-modal-ngx';
import { ModalNostrCredentialComponent } from './modal-nostr-credential/modal-nostr-credential.component';

@Injectable({
  providedIn: 'root'
})
export class CredentialHandlerService {

  constructor(
    private modalService: ModalService
  ) { }

  handle() {
    this.modalService
    .createModal(ModalNostrCredentialComponent)
    .setOutletName('nostrCredential')
    .setData({
      title: 'Accounts' // FIXME: change to il8n
    })
    .build();
  }
}
