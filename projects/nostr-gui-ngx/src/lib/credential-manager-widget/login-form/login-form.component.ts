import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Account, AccountManagerService, CurrentAccountObservable, Ncryptsec, NostrConverter, NostrSigner, NSec, NSecCrypto, ProfileService, UnauthenticatedAccount } from '@belomonte/nostr-ngx';
import { CameraObservable } from '../../camera/camera.observable';
import { NostrValidators } from '../../nostr-validators/nostr.validators';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { LoginFormFields } from './login-form-fields.type';
import { requiredPasswordIfNcryptsecableValidatorFactory } from './required-password-if-ncryptsecable.validator-fn';

@Component({
  selector: 'nostr-login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent implements OnInit {

  loading = false;
  submitted = false;

  showPassword = false;

  @Input()
  accounts: UnauthenticatedAccount[] = [];

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  selected = new EventEmitter<UnauthenticatedAccount>();

  readonly passwordLength = 32;

  formOptions: AbstractControlOptions = {
    validators: [
      requiredPasswordIfNcryptsecableValidatorFactory()
    ]
  };

  loginForm!: FormGroup<{
    nsec: FormControl<string | null>;
    saveNcryptsecLocalStorage: FormControl<boolean | null>;
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private camera$: CameraObservable,
    private profileService: ProfileService,
    private profile$: CurrentAccountObservable,
    private nsecCrypto: NSecCrypto,
    private nostrSigner: NostrSigner,
    private nostrConverter: NostrConverter,
    private accountManagerService: AccountManagerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      nsec: ['', [
        Validators.required.bind(this),
        NostrValidators.nsec
      ]],

      saveNcryptsecLocalStorage: [false],

      password: ['']
    }, this.formOptions);
  }

  getFormControlErrors(fieldName: LoginFormFields): ValidationErrors | null {
    return this.loginForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: LoginFormFields, error: string): boolean {
    const errors = this.loginForm.controls[fieldName].errors || {};
    return errors[error] || false;
  }

  showPasswordField(saveNSecEncryptedChecked: boolean, nsecFieldValue: string): boolean {
    return /^ncryptsec/.test(nsecFieldValue) || saveNSecEncryptedChecked;
  }

  async onUseSigner(): Promise<void> {
    await this.profile$.useExtension();
    if (!this.nostrSigner.hasSignerExtension()) {
      this.changeStep.next('downloadSigner');
    }
  }

  async onLoginSubmit(event: SubmitEvent): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    if (this.loading) {
      return Promise.resolve();
    }

    this.submitted = true;
    if (!this.loginForm.valid) {
      return Promise.resolve();
    }

    const { password, nsec } = this.loginForm.getRawValue() as { password: string, nsec: NSec };
    if (!nsec || !password) {
      return Promise.resolve();
    }

    const user = this.nostrConverter.convertNsecToPublicKeys(nsec);
    const ncrypted = this.nsecCrypto.encryptNSec(nsec, password);

    this.loading = true;

    try {
      const account = await this.profileService.getAccount(user.pubkey);
      await this.addAccount(account, ncrypted);
    } finally {
      this.loading = false;
    }
  }

  async asyncReadQrcodeUsingCamera(): Promise<void> {
    const nsec = await this.camera$.readQrCode();
    this.loginForm.patchValue({ nsec });
    return Promise.resolve();
  }

  private async addAccount(account: Account, ncryptsec: Ncryptsec): Promise<UnauthenticatedAccount | null> {
    this.loginForm.reset();
    const unauthenticatedAccount = await this.accountManagerService.addAccount(account, ncryptsec)
    if (!unauthenticatedAccount) {
      this.changeStep.next('selectAccount');
    } else {
      this.selected.next(unauthenticatedAccount);
      this.changeStep.next('authenticate');
    }

    return Promise.resolve(unauthenticatedAccount);
  }
}
