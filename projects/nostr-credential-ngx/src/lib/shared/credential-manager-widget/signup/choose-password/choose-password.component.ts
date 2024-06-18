import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { TNcryptsec } from '@belomonte/nostr-ngx';
import { FileManagerService } from '../../../file-manager/file-manager.service';
import { NostrSigner } from '../../../profile-service/nostr.signer';
import { AuthModalSteps } from '../../auth-modal-steps.type';
import { TChoosePasswordFields } from './choose-password-fields.type';
import { QrcodeCredentialService } from '../../../qrcode-credential/qrcode-credential.service';

@Component({
  selector: 'nostr-choose-password',
  templateUrl: './choose-password.component.html',
  styleUrl: './choose-password.component.scss'
})
export class ChoosePasswordComponent {

  readonly passwordLength = 32;

  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  ncryptsec?: TNcryptsec | null;
  qrcode = '';

  //  TODO: verificar se o password e confirmPassword combinam
  //  TODO: verificar se este password é capaz de encriptar e decriptar um ncryptsec
  encryptedNsecForm = this.fb.group({

    displayName: ['', [
      Validators.required.bind(this)
    ]],

    password: ['', [
      Validators.required.bind(this)
    ]],

    confirmPassword: ['', [
      Validators.required.bind(this)
    ]]
  });

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  constructor(
    private fb: FormBuilder,
    private nostrSigner: NostrSigner,
    private qrcodeCredentialService: QrcodeCredentialService,
    private fileManagerService: FileManagerService
  ) { }

  updateNcryptsec(password: string): void {
    const ncryptsec = this.nostrSigner.encryptNsec(password);
    this.ncryptsec = ncryptsec;
  }

  getFormControlErrors(fieldName: TChoosePasswordFields): ValidationErrors | null {    
    return this.encryptedNsecForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: TChoosePasswordFields, error: string): boolean {
    const errors = this.encryptedNsecForm.controls[fieldName].errors || {};
    return errors[error] || false;
  }

  showErrors(fieldName: TChoosePasswordFields): boolean {
    return this.submitted && !!this.encryptedNsecForm.controls[fieldName].errors;
  }

  downloadQrcode(): void {
    if (this.ncryptsec) {
      const qrcodeTitle = this.encryptedNsecForm.get('qrcodeTitle')?.value;
      this.fileManagerService.save(this.ncryptsec, this.qrcodeCredentialService.generateFileName(qrcodeTitle));
    }
  }

  onSubmit(): void {

  }
}
