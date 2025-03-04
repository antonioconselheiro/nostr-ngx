import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountsLocalStorage, NostrSigner, ProfileSessionStorage } from '@belomonte/nostr-ngx';
import { CreatingAccount } from '../../../domain/creating-account.interface';
import { NostrValidators } from '../../../nostr-validators/nostr.validators';
import { AuthModalSteps } from '../../auth-modal-steps.type';
import { ChoosePasswordFields } from './choose-password-fields.type';
import { Ncryptsec } from 'nostr-tools/nip19';

@Component({
  selector: 'nostr-choose-password',
  templateUrl: './choose-password.component.html',
  styleUrl: './choose-password.component.scss'
})
export class ChoosePasswordComponent implements OnInit {

  readonly passwordLength = 32;

  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  ncryptsec?: Ncryptsec | null;
  qrcode = '';

  formOptions: AbstractControlOptions = {
    validators: [
      NostrValidators.confirmPassword()
    ]
  };

  encryptedNsecForm!: FormGroup<{
    displayName: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  validSubmit = new EventEmitter<CreatingAccount>();

  constructor(
    private fb: FormBuilder,
    private accountsLocalStorage: AccountsLocalStorage,
    private profileSessionStorage: ProfileSessionStorage,
    private nostrSigner: NostrSigner
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.encryptedNsecForm = this.fb.group({
      displayName: ['', [
        Validators.required
      ]],

      password: ['', [
        Validators.required
      ]],

      confirmPassword: ['']
    }, this.formOptions)
  }

  updateNcryptsec(password: string): void {
    const ncryptsec = this.nostrSigner.getInMemoryNCryptsec(password);
    this.ncryptsec = ncryptsec;
  }

  getFormErrorStatus(errorName: string): boolean {
    return this.encryptedNsecForm.errors?.[errorName] || false;
  }

  getFormControlErrorStatus(fieldName: ChoosePasswordFields, errorName: string): boolean {
    const errors = this.encryptedNsecForm.controls[fieldName].errors || {};
    return errors[errorName] || false;
  }

  showErrors(fieldName: ChoosePasswordFields): boolean {
    return this.submitted && !!this.encryptedNsecForm.controls[fieldName].errors;
  }

  showErrorsConfirmPassword(): boolean {
    return this.submitted &&
      this.encryptedNsecForm.errors && (
        this.encryptedNsecForm.errors['confirmPasswordRequired'] ||
        this.encryptedNsecForm.errors['confirmPasswordInvalid']
      );
  }

  back(): void {
    this.profileSessionStorage.clear();
    if (this.accountsLocalStorage.accounts()) {
      this.changeStep.next('selectAccount')
    } else {
      this.changeStep.next('login');
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.encryptedNsecForm.valid) {
      const raw = this.encryptedNsecForm.getRawValue();
      this.validSubmit.next(raw)
      this.changeStep.next('createNsecAndNcryptsec');
    }
  }
}
