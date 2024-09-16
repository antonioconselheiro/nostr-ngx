import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUnauthenticatedAccount } from '../../../../../nostr-ngx/src/lib/domain/unauthenticated-account.interface';
import { TAuthModalSteps } from '../auth-modal-steps.type';
import { AccountManagerStatefull } from '../../../../../nostr-ngx/src/lib/profile/account-manager.statefull';

@Component({
  selector: 'nostr-select-account',
  templateUrl: './select-account.component.html',
  styleUrl: './select-account.component.scss'
})
export class SelectAccountComponent {

  @Input()
  accounts: IUnauthenticatedAccount[] = [];

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

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
