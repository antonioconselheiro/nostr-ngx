import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AccountAuthenticable, AccountManagerService, AccountSession, CurrentProfileObservable, HexString, NostrConverter, NostrGuard, NostrSigner, NSecCrypto, ProfileProxy } from '@belomonte/nostr-ngx';
import { Ncryptsec, NPub, NSec } from 'nostr-tools/nip19';
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
  accounts: AccountAuthenticable[] = [];

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  selected = new EventEmitter<AccountAuthenticable | null>();

  @Output()
  close = new EventEmitter<void>();

  readonly passwordLength = 32;

  formOptions: AbstractControlOptions = {
    validators: [
      requiredPasswordIfNcryptsecableValidatorFactory()
    ]
  };

  loginForm!: FormGroup<{
    nsec: FormControl<NSec | Ncryptsec | null>;
    saveNcryptsecLocalStorage: FormControl<boolean | null>;
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private guard: NostrGuard,
    private nsecCrypto: NSecCrypto,
    private nostrSigner: NostrSigner,
    private camera$: CameraObservable,
    private nostrConverter: NostrConverter,
    private profileProxy: ProfileProxy,
    private profile$: CurrentProfileObservable,
    private accountManagerService: AccountManagerService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      nsec: [null as NSec | Ncryptsec | null, [
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
    return this.guard.isNcryptsec(nsecFieldValue) || saveNSecEncryptedChecked;
  }

  async onUseSigner(): Promise<void> {
    this.loading = true;
    try {
      await this.profile$.useExtension();
    } finally {
      this.loading = false;
    }

    if (!this.nostrSigner.hasSignerExtension()) {
      this.changeStep.next('downloadSigner');
    }

    this.close.emit();
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

    const { password, nsec, saveNcryptsecLocalStorage } = this.loginForm.getRawValue();
    if (!nsec) {
      return Promise.resolve();
    }

    this.loading = true;

    try {
      let ncrypted: Ncryptsec | undefined = undefined;
      let account: AccountSession;
      let user: {
        npub: NPub;
        pubkey: HexString;
      };

      if (this.guard.isNSec(nsec)) {
        user = this.nostrConverter.convertNSecToPublicKeys(nsec);
        if (password) {
          ncrypted = this.nsecCrypto.encryptNSec(nsec, password);
        }
        // TODO: tlvz deva remover esse true fixo e colocar uma opção para o usuário?
        account = await this.profile$.authenticateWithNSec(nsec, true);
      } else if (this.guard.isNcryptsec(nsec) && password) {
        ncrypted = nsec;
        user = this.nostrConverter.convertNSecToPublicKeys(this.nsecCrypto.decryptNcryptsec(nsec, password));
        // TODO: tlvz deva remover esse true fixo e colocar uma opção para o usuário?
        account = await this.profile$.authenticateWithNcryptsec(ncrypted, password, true);
      } else {
        return Promise.reject(new Error('invalid credential given'));
      }


      if (ncrypted && saveNcryptsecLocalStorage) {
        if (!account) {
          account = await this.profileProxy.loadAccount(user.pubkey, 'complete');
        }
        await this.addAccount(account, ncrypted);
      }

      this.close.emit();
    } finally {
      this.loading = false;
    }
  }

  async asyncReadQrcodeUsingCamera(): Promise<void> {
    const nsec = await this.camera$.readQrCode();
    if (this.guard.isNSec(nsec) || this.guard.isNcryptsec(nsec)) {
      this.loginForm.patchValue({ nsec });
    }

    return Promise.resolve();
  }

  private async addAccount(account: AccountSession, ncryptsec: Ncryptsec): Promise<AccountAuthenticable | null> {
    this.loginForm.reset();
    const authenticableAccount = await this.accountManagerService.addAccount(account, ncryptsec)
    if (!authenticableAccount) {
      this.changeStep.next('selectAccount');
    } else {
      this.selected.next(authenticableAccount);
      this.changeStep.next('authenticate');
    }

    return Promise.resolve(authenticableAccount);
  }
}
