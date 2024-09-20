import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NostrConverter, Ncryptsec, NSec, NostrLocalConfigRelays, NPub } from '@belomonte/nostr-ngx';
import { CameraObservable } from '../../camera/camera.observable';
import { NostrValidators } from '../../nostr-validators/nostr.validators';
import { TAuthModalSteps } from '../auth-modal-steps.type';
import { requiredPasswordIfNcryptsecableValidatorFactory } from './required-password-if-ncryptsecable.validator-fn';
import { TLoginFormFields } from './login-form-fields.type';
import { NostrMetadata } from '@nostrify/nostrify';

@Component({
  selector: 'nostr-login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent implements OnInit {

  loading = false;
  submitted = false;

  showNSec = false;
  showPassword = false;

  @Input()
  accounts: IUnauthenticatedAccount[] = [];

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  @Output()
  selected = new EventEmitter<IUnauthenticatedAccount>();

  readonly passwordLength = 32;

  formOptions: AbstractControlOptions = {
    validators: [
      requiredPasswordIfNcryptsecableValidatorFactory()
    ]
  };

  accountForm!: FormGroup<{
    nsec: FormControl<string | null>;
    saveNcryptsecLocalStorage: FormControl<boolean | null>;
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private camera$: CameraObservable,
    private profileService: ProfileService,
    private nostrSigner: NostrSigner,
    private nostrConverter: NostrConverter,
    private accountManagerService: AccountManagerStatefull
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.accountForm = this.fb.group({
      nsec: ['', [
        Validators.required.bind(this),
        NostrValidators.nsec
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

    const { password, nsec } = this.accountForm.getRawValue() as { password: string, nsec: NSec };
    if (!nsec || !password) {
      return Promise.resolve();
    }

    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const ncrypted = this.nostrSigner.encryptNsec(password, nsec);

    this.loading = true;
    this.profileService
      .load(user.npub)
      .then(profile => this.addAccount(user.npub, profile, ncrypted))
      .finally(() => this.loading = false);
  }

  async asyncReadQrcodeUsingCamera(): Promise<void> {
    const nsec = await this.camera$.readQrCode();
    this.accountForm.patchValue({ nsec });
    return Promise.resolve();
  }

  private addAccount(npub: NPub, profile: NostrMetadata, ncryptsec: Ncryptsec, relays: NostrLocalConfigRelays): void {
    if (profile.load) {
      this.accountForm.reset();
      const unauthenticatedAccount = this.accountManagerService.addAccount(npub, profile, ncryptsec, relays);
      if (!unauthenticatedAccount) {
        this.changeStep.next('selectAccount');
      } else {
        this.selected.next(unauthenticatedAccount);
        this.changeStep.next('authenticate');
      }

    } else {
      this.accountForm.controls['nsec'].setErrors({
        nsecNotFound: true
      });
    }
  }
}
