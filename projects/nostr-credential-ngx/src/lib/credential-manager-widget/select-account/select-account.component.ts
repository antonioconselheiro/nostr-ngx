import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user.interface';
import { TAuthModalSteps } from '../auth-modal-steps.type';
import { AccountManagerStatefull } from '../../profile-service/account-manager.statefull';

@Component({
  selector: 'nostr-select-account',
  templateUrl: './select-account.component.html',
  styleUrl: './select-account.component.scss'
})
export class SelectAccountComponent {

  @Input()
  accounts: IUnauthenticatedUser[] = [];

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  @Output()
  selected = new EventEmitter<IUnauthenticatedUser>();

  constructor(
    private accountManagerService: AccountManagerStatefull
  ) { }

  logout(account: IUnauthenticatedUser): void {
    this.accountManagerService.removeAccount(account);

    //  wait the observable send centralizated
    //  and updated info of account amount
    setTimeout(() => {
      if (!this.accounts.length) {
        this.changeStep.next('login');
      }
    });
  }

  selectAccount(account: IUnauthenticatedUser): void {
    this.selected.emit(account);
    this.changeStep.next('authenticate');
  }
}
