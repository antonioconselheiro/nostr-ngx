import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticatedProfileObservable } from '../../nostr-credential/authenticated-profile.observable';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'auth-authenticate-modal',
  templateUrl: './authenticate-modal.component.html',
  styleUrl: './authenticate-modal.component.scss'
})
export class AuthenticateModalComponent {

  @Input()
  account: IUnauthenticatedUser | null = null;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  close = new EventEmitter<void>();

  @ViewChild('pin')
  pinField?: ElementRef;

  showPin = false;
  submitted = false;
  loading = false;
  readonly pinLength = 8;

  authenticateForm = this.fb.group({
    pin: ['', [
      Validators.required.bind(this),
    ]]
  });

  constructor(
    private fb: FormBuilder,
    private profiles$: AuthenticatedProfileObservable
  ) { }


  ngAfterViewInit(): void {
    this.pinField?.nativeElement?.focus();
  }

  getFormControlErrorStatus(error: string): boolean {
    const errors = this.authenticateForm.controls.pin.errors || {};
    return errors[error] || false;
  }

  showErrors(): boolean {
    return this.submitted && !!this.authenticateForm.controls.pin.errors;
  }

  onAuthenticateSubmit(event: SubmitEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.submitted = true;

    const account = this.account;
    const { pin } = this.authenticateForm.getRawValue();
    if (!this.authenticateForm.valid || !account) {
      return;
    }
    this.loading = true;
    try {
      this.profiles$.authenticateAccount(account, pin ?? '')
        .then(() => this.close.emit())
        //  FIXME: consigo centralizar o tratamento de catch para promises?
        .catch(e => {
          //  FIXME: validar situações onde realmente pode ocorrer
          //  um erro e tratar na tela com uma mensagem
          this.networkError$.next(e);
        })
        .finally(() => this.loading = false);
    } catch {
      this.loading = false;
      this.authenticateForm.controls.pin.setErrors({
        invalid: true
      });
    }
  }
}
