import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalableDirective } from '@belomonte/async-modal-ngx';
import { AuthModalArguments } from '../auth-modal-arguments.interface';
import { Subject, Subscription } from 'rxjs';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { CreatingAccount } from '../../domain/creating-account.interface';
import { NostrMetadata } from '@nostrify/nostrify';
import { AccountManagerService, UnauthenticatedAccount } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-modal-nostr-credential',
  templateUrl: './modal-nostr-credential.component.html',
  styleUrl: './modal-nostr-credential.component.scss'
})
export class ModalNostrCredentialComponent
  extends ModalableDirective<AuthModalArguments | null, NostrMetadata | null>
  implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  response = new Subject<NostrMetadata | null | void>();

  auth: NostrMetadata | null = null;
  accounts: UnauthenticatedAccount[] = [];

  authenticatingAccount: UnauthenticatedAccount | null = null;
  creatingAccount: CreatingAccount | null = null;
  currentStep: AuthModalSteps | null = null;

  constructor(
    private accountManagerService: AccountManagerService
  ) {
    super();
  }

  ngOnInit(): void {
    this.bindAccountsSubscription();
    this.setInitialScreen();
  }

  private bindAccountsSubscription(): void {
    this.subscriptions.add(this.accountManagerService.accounts$.subscribe({
      next: accounts => this.accounts = accounts
    }));
  }

  onChangeStep(step: AuthModalSteps): void {
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

  override onInjectData(data: AuthModalArguments | null): void {
    if (data?.currentStep) {
      this.currentStep = data?.currentStep;
    }

    if (data?.currentAuthProfile) {
      this.auth = data?.currentAuthProfile;
    }
  }
}
