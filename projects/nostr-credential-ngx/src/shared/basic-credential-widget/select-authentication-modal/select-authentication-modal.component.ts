import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { AccountManagerStatefull } from '../../profile-service/account-manager.statefull';

@Component({
  selector: 'nostr-select-authentication-modal',
  templateUrl: './select-authentication-modal.component.html',
  styleUrl: './select-authentication-modal.component.scss'
})
export class SelectAuthenticationModalComponent {

  @Input()
  accounts: IUnauthenticatedUser[] = [];

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  selected = new EventEmitter<IUnauthenticatedUser>();

  constructor(
    private accountManagerService: AccountManagerStatefull
  ) { }

  logout(account: IUnauthenticatedUser): void {
    this.accountManagerService.removeAccount(account);

    //  wait the observable send centralizated
    //  and updated info of account amount
    // eslint-disable-next-line ban/ban
    setTimeout(() => {
      if (!this.accounts.length) {
        this.changeStep.next('add-account');
      }
    });
  }

  selectAccount(account: IUnauthenticatedUser): void {
    this.selected.emit(account);
    this.changeStep.next('authenticate');
  }
}
