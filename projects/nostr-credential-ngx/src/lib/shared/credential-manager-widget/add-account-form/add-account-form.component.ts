import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { NostrConverter, TNcryptsec, TNostrSecret } from '@belomonte/nostr-ngx';
import { IProfile } from '../../../domain/profile.interface';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user.interface';
import { CameraObservable } from '../../camera/camera.observable';
import { NostrValidators } from '../../nostr-validators/nostr.validators';
import { NostrSigner } from '../../profile-service/nostr.signer';
import { ProfileProxy } from '../../profile-service/profile.proxy';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { AccountManagerStatefull } from '../../profile-service/account-manager.statefull';

@Component({
  selector: 'nostr-add-account-form',
  templateUrl: './add-account-form.component.html',
  styleUrl: './add-account-form.component.scss'
})
export class AddAccountFormComponent {

  @Input()
  accounts: IUnauthenticatedUser[] = [];

  loading = false;
  submitted = false;

  showNostrSecret = false;
  showPassword = false;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  selected = new EventEmitter<IUnauthenticatedUser>();

  readonly passwordLength = 8;

  accountForm = this.fb.group({
    nsec: ['', [
      Validators.required.bind(this),
      NostrValidators.nostrSecret
    ]],

    password: ['', [
      Validators.required.bind(this)
    ]]
  });

  constructor(
    private fb: FormBuilder,
    private camera$: CameraObservable,
    private profileProxy: ProfileProxy,
    private nostrSigner: NostrSigner,
    private nostrConverter: NostrConverter,
    private accountManagerService: AccountManagerStatefull
  ) { }

  getFormControlErrors(fieldName: 'nsec' | 'password'): ValidationErrors | null {
    return this.accountForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: 'nsec' | 'password', error: string): boolean {
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

    const { password, nsec } = this.accountForm.getRawValue() as { password: string, nsec: TNostrSecret };
    if (!nsec || !password) {
      return Promise.resolve();
    }

    const user = this.nostrConverter.convertNostrSecretToPublic(nsec);
    const ncrypted = this.nostrSigner.getEncryptedNostrSecret(password, nsec);

    this.loading = true;
    this.profileProxy
      .load(user.npub)
      .then(profile => this.addAccount(profile, ncrypted))
      .finally(() => this.loading = false);
  }

  readQrcodeUsingCamera(passwordEl: HTMLInputElement): void {
    this.asyncReadQrcodeUsingCamera()
      .then(() => passwordEl.focus());
  }

  async asyncReadQrcodeUsingCamera(): Promise<void> {
    const nsec = await this.camera$.readQrCode();
    this.accountForm.patchValue({ nsec });
    return Promise.resolve();
  }

  private addAccount(profile: IProfile, ncryptsec: TNcryptsec): void {
    if (profile.load) {
      this.accountForm.reset();
      const unauthenticatedAccount = this.accountManagerService.addAccount(profile, ncryptsec);
      if (!unauthenticatedAccount) {
        this.changeStep.next('select-account');
      } else {
        this.selected.next(unauthenticatedAccount);
        this.changeStep.next('authenticate');
      }

    } else {
      this.accountForm.controls['nsec'].setErrors({
        nostrSecretNotFound: true
      });
    }
  }
}
