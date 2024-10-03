import { Injectable } from '@angular/core';
import { ModalService } from '@belomonte/async-modal-ngx';
import { ModalNostrCredentialComponent } from './modal-nostr-credential/modal-nostr-credential.component';
import { AccountsLocalStorage } from '@belomonte/nostr-ngx';

@Injectable({
  providedIn: 'root'
})
export class CredentialHandlerService {

  constructor(
    private modalService: ModalService,
    private accountsLocalStorage: AccountsLocalStorage
  ) { }

  start(): void {
    const { accounts } = this.accountsLocalStorage.read();
    if (!accounts || !accounts.length) {
      this.modalService
        .createModal(ModalNostrCredentialComponent)
        .setOutletName('nostrCredential')
        .setData({
          title: 'Login' // FIXME: change to il8n
        })
        .build();
    } else {
      this.selectAccount();
    }
  }

  selectAccount(): void {
    this.modalService
      .createModal(ModalNostrCredentialComponent)
      .setOutletName('nostrCredential')
      .setData({
        title: 'Accounts', // FIXME: change to il8n
        currentStep: 'selectAccount'
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
