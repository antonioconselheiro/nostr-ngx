import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user';
import { ProfileProxy } from '../../profile-service/profile.proxy';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { NostrValidators } from '../../nostr-validators/nostr.validators';
import { AccountManagerService } from '../account-manager.service';
import { IProfile } from '../../../domain/profile.interface';
import { DataLoadEnum, TNcryptsec, TNostrPublic, TNostrSecret } from '@belomonte/nostr-ngx';
import { CameraObservable } from '../../camera/camera.observable';
import { getPublicKey, nip19 } from 'nostr-tools';
import { NostrSigner } from '../../profile-service/nostr.signer';

@Component({
  selector: 'auth-add-account-modal',
  templateUrl: './add-account-modal.component.html',
  styleUrl: './add-account-modal.component.scss'
})
export class AddAccountModalComponent {
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
      Validators.required.bind(this),
    ]]
  });

  constructor(
    private fb: FormBuilder,
    private camera$: CameraObservable,
    private profileProxy: ProfileProxy,
    private nostrSigner: NostrSigner,
    private accountManagerService: AccountManagerService
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

    this.submitted = true;
    if (!this.accountForm.valid) {
      return;
    }

    const { password, nsec } = this.accountForm.getRawValue() as { password: string, nsec: TNostrSecret };
    if (!nsec || !password) {
      return;
    }

    const user = this.derivateUserFromNostrSecret(nsec as TNostrSecret);
    const ncrypted = this.nostrSigner.getEncryptedNostrSecret(password, nsec);

    this.loading = true;
    this.profileProxy
      .load(user.npub)
      .then(profile => this.addAccount(profile, ncrypted))
      .finally(() => this.loading = false);
  }

  private derivateUserFromNostrSecret(nostrSecret: TNostrSecret): { npub: TNostrPublic, pubhex: string } {
    const { data } = nip19.decode(nostrSecret);
    const pubhex = getPublicKey(data);

    return { pubhex, npub: nip19.npubEncode(pubhex) };
  }

  readQrcodeUsingCamera(pin?: HTMLInputElement): void {
    this.asyncReadQrcodeUsingCamera()
      .then(() => pin?.focus())
  }

  async asyncReadQrcodeUsingCamera(): Promise<void> {
    const nsec = await this.camera$.readQrCode();
    this.accountForm.patchValue({ nsec });
    return Promise.resolve();
  }

  private addAccount(profile: IProfile, ncryptsec: TNcryptsec): void {
    if (profile.load === DataLoadEnum.EAGER_LOADED) {
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
