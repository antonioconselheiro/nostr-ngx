import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccountManagerService, CurrentAccountObservable, NostrSigner, UnauthenticatedAccount } from '@belomonte/nostr-ngx';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-select-account',
  templateUrl: './select-account.component.html',
  styleUrl: './select-account.component.scss'
})
export class SelectAccountComponent {

  @Input()
  accounts: UnauthenticatedAccount[] = [];

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  selected = new EventEmitter<UnauthenticatedAccount | null>();

  @Output()
  close = new EventEmitter<void>();

  constructor(
    private nostrSigner: NostrSigner,
    private profile$: CurrentAccountObservable,
    private accountManagerService: AccountManagerService
  ) { }

  logout(account: UnauthenticatedAccount): void {
    this.accountManagerService.removeAccount(account);

    //  wait the observable send centralizated
    //  and updated info of account amount
    setTimeout(() => {
      if (!this.accounts.length) {
        this.changeStep.next('login');
      }
    });
  }

  selectAccount(account: UnauthenticatedAccount): void {
    this.selected.emit(account);
    this.changeStep.next('authenticate');
  }

  async onUseSigner(): Promise<void> {
    await this.profile$.useExtension();
    if (!this.nostrSigner.hasSignerExtension()) {
      this.changeStep.next('downloadSigner');
    }

    this.close.emit();
  }
}
