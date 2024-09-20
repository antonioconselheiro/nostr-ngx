import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { AuthenticatedAccountObservable, IUnauthenticatedAccount } from '@belomonte/nostr-ngx';

@Component({
  selector: 'nostr-authenticate-form',
  templateUrl: './authenticate-form.component.html',
  styleUrl: './authenticate-form.component.scss'
})
export class AuthenticateFormComponent implements OnInit, AfterViewInit {

  @Input()
  account: IUnauthenticatedAccount | null = null;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  close = new EventEmitter<void>();

  @ViewChild('showPassword')
  passwordField?: ElementRef;

  showPassword = false;
  submitted = false;
  loading = false;
  readonly passwordLength = 32;

  authenticateForm!: FormGroup<{
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private profiles$: AuthenticatedAccountObservable
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.passwordField?.nativeElement?.focus();
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
