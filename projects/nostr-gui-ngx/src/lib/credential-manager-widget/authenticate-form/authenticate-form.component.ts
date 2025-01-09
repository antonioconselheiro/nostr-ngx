import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountAuthenticable, CurrentAccountObservable } from '@belomonte/nostr-ngx';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-authenticate-form',
  templateUrl: './authenticate-form.component.html',
  styleUrl: './authenticate-form.component.scss'
})
export class AuthenticateFormComponent implements OnInit {

  @Input()
  account: AccountAuthenticable | null = null;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  close = new EventEmitter<void>();

  showPassword = false;
  submitted = false;
  loading = false;
  readonly passwordLength = 32;

  authenticateForm!: FormGroup<{
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private profiles$: CurrentAccountObservable
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const authenticateForm = this.fb.group({
      password: ['', [
        Validators.required.bind(this),
      ]]
    });

    this.authenticateForm = authenticateForm;
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
      this.profiles$.authenticateAccount(account, password ?? '');

      setTimeout(() => {
        this.close.emit();
        this.loading = false;
      }, 0);
    } catch {
      this.loading = false;
      this.authenticateForm.controls.password.setErrors({
        invalid: true
      });
    }
  }
}
