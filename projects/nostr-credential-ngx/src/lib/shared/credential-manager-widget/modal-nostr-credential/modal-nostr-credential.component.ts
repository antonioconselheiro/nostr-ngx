import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProfile } from '../../../domain/profile.interface';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { IAuthModalArguments } from '../auth-modal-arguments.interface';
import { Subject, Subscription } from 'rxjs';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user.interface';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { AccountManagerStatefull } from '../../profile-service/account-manager.statefull';

@Component({
  selector: 'nostr-modal-nostr-credential',
  templateUrl: './modal-nostr-credential.component.html',
  styleUrl: './modal-nostr-credential.component.scss'
})
export class ModalNostrCredentialComponent
  extends ModalableDirective<IAuthModalArguments | null, IProfile | null>
  implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  response = new Subject<void | IProfile | null>();

  auth: IProfile | null = null;
  accounts: IUnauthenticatedUser[] = [];

  authenticatingAccount: IUnauthenticatedUser | null = null;
  currentStep: AuthModalSteps | null = null;

  constructor(
    private nostrSecretStatefull: AccountManagerStatefull
  ) {
    super();
  }

  ngOnInit(): void {
    this.bindAccountsSubscription();
    this.setInitialScreen();
  }

  private bindAccountsSubscription(): void {
    this.subscriptions.add(this.nostrSecretStatefull.accounts$.subscribe({
      next: accounts => this.accounts = accounts
    }));
  }

  onChangeStep(step: AuthModalSteps): void {
    // let a tick to the screen click effect
    // eslint-disable-next-line ban/ban
    setTimeout(() => this.currentStep = step);
  }

  private setInitialScreen(): void {
    if (!this.currentStep) {
      this.currentStep = this.accounts.length ? 'select-account' : 'add-account';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  override onInjectData(data: IAuthModalArguments | null): void {
    if (data?.currentStep) {
      this.currentStep = data?.currentStep;
    }

    if (data?.currentAuthProfile) {
      this.auth = data?.currentAuthProfile;
    }
  }
}
