import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-select-account',
  templateUrl: './select-account.component.html',
  styleUrl: './select-account.component.scss'
})
export class SelectAccountComponent {

  @Input()
  accounts: IUnauthenticatedAccount[] = [];

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  selected = new EventEmitter<IUnauthenticatedAccount>();

  constructor(
    private accountManagerService: AccountManagerStatefull
  ) { }

  logout(account: IUnauthenticatedAccount): void {
    this.accountManagerService.removeAccount(account);

    //  wait the observable send centralizated
    //  and updated info of account amount
    setTimeout(() => {
      if (!this.accounts.length) {
        this.changeStep.next('login');
      }
    });
  }

  selectAccount(account: IUnauthenticatedAccount): void {
    this.selected.emit(account);
    this.changeStep.next('authenticate');
  }
}
