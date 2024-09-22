import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { AccountManagerService, UnauthenticatedAccount } from '@belomonte/nostr-ngx';

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
  selected = new EventEmitter<UnauthenticatedAccount>();

  constructor(
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
}
