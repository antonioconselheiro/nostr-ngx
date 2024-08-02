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

  login() {
    this.modalService
      .createModal(ModalNostrCredentialComponent)
      .setOutletName('nostrCredential')
      .setData({
        title: 'Accounts' // FIXME: change to il8n
      })
      .build();
  }

  addAccount(): void {
    this.modalService
      .createModal(ModalNostrCredentialComponent)
      .setOutletName('nostrCredential')
      .setData({
        title: 'Accounts', // FIXME: change to il8n
        currentStep: 'authenticate'
      })
      .build();
  }

  editProfile(): void {
    this.modalService
      .createModal(ModalNostrCredentialComponent)
      .setOutletName('nostrCredential')
      .setData({
        title: 'Accounts', // FIXME: change to il8n
        currentStep: 'registerAccount'
      })
      .build();
  }

  manageRelays(): void {
    this.modalService
      .createModal(ModalNostrCredentialComponent)
      .setOutletName('nostrCredential')
      .setData({
        title: 'Accounts', // FIXME: change to il8n
        currentStep: 'relayManager'
      })
      .build();
  }

  downloadCredentials(): void {

  }

  downloadSigner(): void {
    this.modalService
      .createModal(ModalNostrCredentialComponent)
      .setOutletName('nostrCredential')
      .setData({
        title: 'Accounts', // FIXME: change to il8n
        currentStep: 'downloadSigner'
      })
      .build();
  }

}
