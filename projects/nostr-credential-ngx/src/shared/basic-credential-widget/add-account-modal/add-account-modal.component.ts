import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { IUnauthenticatedUser } from '../../../domain/unauthenticated-user';
import { ProfileProxy } from '../../profile-service/profile.proxy';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { NostrValidators } from '../../nostr-validators/nostr.validators';
import { AccountManagerService } from '../account-manager.service';
import { IProfile } from '../../../domain/profile.interface';
import { DataLoadEnum } from '@belomonte/nostr-ngx';
import { CameraObservable } from '../../camera/camera.observable';

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
  showPin = false;

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  selected = new EventEmitter<IUnauthenticatedUser>();

  readonly pinLength = 8;

  accountForm = this.fb.group({
    nsec: ['', [
      Validators.required.bind(this),
      NostrValidators.nostrSecret
    ]],

    pin: ['', [
      Validators.required.bind(this),
    ]]
  });

  constructor(
    private fb: FormBuilder,
    private camera$: CameraObservable,
    private profileProxy: ProfileProxy,
    private accountManagerService: AccountManagerService
  ) { }

  getFormControlErrors(fieldName: 'nsec' | 'pin'): ValidationErrors | null {
    return this.accountForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: 'nsec' | 'pin', error: string): boolean {
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

    const { pin, nsec } = this.accountForm.getRawValue()
    if (!nsec || !pin) {
      return;
    }

    const user = new NostrUser(nsec);
    this.loading = true;
    this.profileProxy
      .load(user.nostrPublic)
      .then(profile => this.addAccount(profile, user, pin ?? ''))
      //  FIXME: consigo centralizar o tratamento de catch para promises?
      .catch(e => {
        //  FIXME: validar situações onde realmente pode ocorrer
        //  um erro e tratar na tela com uma mensagem
        this.networkError$.next(e);
      })
      .finally(() => this.loading = false);
  }

  readQrcodeUsingCamera(pin?: HTMLInputElement): void {
    this.asyncReadQrcodeUsingCamera()
      .then(() => pin?.focus())
      .catch(e => this.error$.next(e))
  }

  async asyncReadQrcodeUsingCamera(): Promise<void> {
    const nsec = await this.camera$.readQrCode();
    this.accountForm.patchValue({ nsec });
    return Promise.resolve();
  }

  private addAccount(profile: IProfile, user: NostrUser, pin: string): void {
    if (profile.load === DataLoadEnum.EAGER_LOADED) {
      this.accountForm.reset();
      const unauthenticatedAccount = this.accountManagerService.addAccount({ ...profile, user }, pin);
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
