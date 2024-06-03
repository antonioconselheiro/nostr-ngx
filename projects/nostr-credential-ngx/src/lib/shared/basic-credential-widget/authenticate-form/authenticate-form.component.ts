import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticatedProfileObservable } from '../../profile-service/authenticated-profile.observable';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user.interface';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-authenticate-form',
  templateUrl: './authenticate-form.component.html',
  styleUrl: './authenticate-form.component.scss'
})
export class AuthenticateFormComponent {

  @Input()
  account: IUnauthenticatedUser | null = null;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  close = new EventEmitter<void>();

  @ViewChild('showPassword')
  passwordField?: ElementRef;

  showPassword = false;
  submitted = false;
  loading = false;
  readonly passwordLength = 8;

  authenticateForm = this.fb.group({
    password: ['', [
      Validators.required.bind(this),
    ]]
  });

  constructor(
    private fb: FormBuilder,
    private profiles$: AuthenticatedProfileObservable
  ) { }

  ngAfterViewInit(): void {
    this.passwordField?.nativeElement?.focus();
  }

  getFormControlErrorStatus(error: string): boolean {
    const errors = this.authenticateForm.controls.password.errors || {};
    return errors[error] || false;
  }

  showErrors(): boolean {
    return this.submitted && !!this.authenticateForm.controls.password.errors;
  }

  onAuthenticateSubmit(event: SubmitEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.submitted = true;

    const account = this.account;
    const { password } = this.authenticateForm.getRawValue();
    if (!this.authenticateForm.valid || !account) {
      return;
    }
    this.loading = true;

    try {
      this.profiles$.authenticateAccount(account, password ?? '')
        .then(() => this.close.emit())
        .finally(() => this.loading = false);
    } catch {
      this.loading = false;
      this.authenticateForm.controls.password.setErrors({
        invalid: true
      });
    }
  }
}
