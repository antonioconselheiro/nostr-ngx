import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NostrConverter, TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';
import { IProfile } from '../../domain/profile.interface';
import { IUnauthenticatedUser } from '../../domain/unauthenticated-user.interface';
import { CameraObservable } from '../../camera/camera.observable';
import { NostrValidators } from '../../nostr-validators/nostr.validators';
import { AccountManagerStatefull } from '../../profile-service/account-manager.statefull';
import { NostrSigner } from '../../profile-service/nostr.signer';
import { ProfileProxy } from '../../profile-service/profile.proxy';
import { TAuthModalSteps } from '../auth-modal-steps.type';
import { requiredPasswordIfNcryptsecableValidatorFactory } from './required-password-if-ncryptsecable.validator-fn';
import { TLoginFormFields } from './login-form-fields.type';

@Component({
  selector: 'nostr-login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent implements OnInit {

  loading = false;
  submitted = false;

  showNostrSecret = false;
  showPassword = false;

  @Input()
  accounts: IUnauthenticatedUser[] = [];

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  @Output()
  selected = new EventEmitter<IUnauthenticatedUser>();

  readonly passwordLength = 32;

  formOptions: AbstractControlOptions = {
    validators: [
      requiredPasswordIfNcryptsecableValidatorFactory()
    ]
  };

  accountForm!: FormGroup<{
    nostrSecret: FormControl<string | null>;
    saveNcryptsecLocalStorage: FormControl<boolean | null>;
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private camera$: CameraObservable,
    private profileProxy: ProfileProxy,
    private nostrSigner: NostrSigner,
    private nostrConverter: NostrConverter,
    private accountManagerService: AccountManagerStatefull
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.accountForm = this.fb.group({
      nostrSecret: ['', [
        Validators.required.bind(this),
        NostrValidators.nostrSecret
      ]],

      saveNcryptsecLocalStorage: [true],

      password: ['']
    }, this.formOptions);
  }

  getFormControlErrors(fieldName: TLoginFormFields): ValidationErrors | null {
    return this.accountForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: TLoginFormFields, error: string): boolean {
    const errors = this.accountForm.controls[fieldName].errors || {};
    return errors[error] || false;
  }

  async onAddAccountSubmit(event: SubmitEvent): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    if (this.loading) {
      return Promise.resolve();
    }

    this.submitted = true;
    if (!this.accountForm.valid) {
      return Promise.resolve();
    }

    const { password, nostrSecret } = this.accountForm.getRawValue() as { password: string, nostrSecret: TNostrSecret };
    if (!nostrSecret || !password) {
      return Promise.resolve();
    }

    const user = this.nostrConverter.convertNsecToNpub(nostrSecret);
    const ncrypted = this.nostrSigner.encryptNsec(password, nostrSecret);

    this.loading = true;
    this.profileProxy
      .load(user.npub)
      .then(profile => this.addAccount(profile, ncrypted))
      .finally(() => this.loading = false);
  }

  async asyncReadQrcodeUsingCamera(): Promise<void> {
    const nostrSecret = await this.camera$.readQrCode();
    this.accountForm.patchValue({ nostrSecret });
    return Promise.resolve();
  }

  private addAccount(profile: IProfile, ncryptsec: TNcryptsec): void {
    if (profile.load) {
      this.accountForm.reset();
      const unauthenticatedAccount = this.accountManagerService.addAccount(profile, ncryptsec);
      if (!unauthenticatedAccount) {
        this.changeStep.next('selectAccount');
      } else {
        this.selected.next(unauthenticatedAccount);
        this.changeStep.next('authenticate');
      }

    } else {
      this.accountForm.controls['nostrSecret'].setErrors({
        nostrSecretNotFound: true
      });
    }
  }
}
