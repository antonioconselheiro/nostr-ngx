import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { IAuthModalArguments } from '../auth-modal-arguments.interface';
import { Subject, Subscription } from 'rxjs';
import { IUnauthenticatedAccount } from '../../domain/unauthenticated-account.interface';
import { TAuthModalSteps } from '../auth-modal-steps.type';
import { AccountManagerStatefull } from '../../profile-service/account-manager.statefull';
import { ICreatingAccount } from '../../domain/creating-account.interface';
import { NostrMetadata } from '@nostrify/nostrify';

@Component({
  selector: 'nostr-modal-nostr-credential',
  templateUrl: './modal-nostr-credential.component.html',
  styleUrl: './modal-nostr-credential.component.scss'
})
export class ModalNostrCredentialComponent
  extends ModalableDirective<IAuthModalArguments | null, NostrMetadata | null>
  implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  response = new Subject<NostrMetadata | null | void>();

  auth: NostrMetadata | null = null;
  accounts: IUnauthenticatedAccount[] = [];

  authenticatingAccount: IUnauthenticatedAccount | null = null;
  creatingAccount: ICreatingAccount | null = null;
  currentStep: TAuthModalSteps | null = null;

  constructor(
    private accountManagerStatefull: AccountManagerStatefull
  ) {
    super();
  }

  ngOnInit(): void {
    this.bindAccountsSubscription();
    this.setInitialScreen();
  }

  private bindAccountsSubscription(): void {
    this.subscriptions.add(this.accountManagerStatefull.accounts$.subscribe({
      next: accounts => this.accounts = accounts
    }));
  }

  onChangeStep(step: TAuthModalSteps): void {
    // let a tick to the screen click effect
    setTimeout(() => this.currentStep = step);
  }

  private setInitialScreen(): void {
    if (!this.currentStep) {
      this.currentStep = this.accounts.length ? 'selectAccount' : 'login';
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
