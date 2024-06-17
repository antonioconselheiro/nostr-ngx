import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { TNcryptsec } from '@belomonte/nostr-ngx';
import { FileManagerService } from '../../file-manager/file-manager.service';
import { NostrSigner } from '../../profile-service/nostr.signer';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { TEncryptNsecFields } from './encrypt-nsec-fields.type';
import { QrcodeCredentialService } from '../../qrcode-credential/qrcode-credential.service';

@Component({
  selector: 'nostr-encrypt-nsec',
  templateUrl: './encrypt-nsec.component.html',
  styleUrl: './encrypt-nsec.component.scss'
})
export class EncryptNsecComponent {

  readonly passwordLength = 32;

  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  ncryptsec?: TNcryptsec | null;
  qrcode = '';

  encryptedNsecForm = this.fb.group({

    password: ['', [
      Validators.required.bind(this)
    ]],

    confirmPassword: ['', [
      Validators.required.bind(this)
    ]],

    qrcodeName: ['']
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

  getFormControlErrors(fieldName: TEncryptNsecFields): ValidationErrors | null {    
    return this.encryptedNsecForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: TEncryptNsecFields, error: string): boolean {
    const errors = this.encryptedNsecForm.controls[fieldName].errors || {};
    return errors[error] || false;
  }

  showErrors(fieldName: TEncryptNsecFields): boolean {
    return this.submitted && !!this.encryptedNsecForm.controls[fieldName].errors;
  }

  downloadQrcode(): void {
    if (this.ncryptsec) {
      const qrcodeTitle = this.encryptedNsecForm.get('qrcodeTitle')?.value;
      this.fileManagerService.save(this.ncryptsec, this.qrcodeCredentialService.generateFileName(qrcodeTitle));
    }
  }

  renderQRCode(): void {
    
  }

  onSubmit(): void {

  }
}
