import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { TNcryptsec } from '@belomonte/nostr-ngx';
import { nip19 } from 'nostr-tools';
import * as nip49 from 'nostr-tools/nip49';
import { FileManagerService } from '../../file-manager/file-manager.service';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { TEncryptNostrSecretFields } from './encrypt-nostr-secret-fields.type';

@Component({
  selector: 'nostr-encrypt-nostr-secret',
  templateUrl: './encrypt-nostr-secret.component.html',
  styleUrl: './encrypt-nostr-secret.component.scss'
})
export class EncryptNostrSecretComponent {

  readonly passwordLength = 32;

  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  ncryptsec?: TNcryptsec;
  qrcode = '';

  generateNostrSecretForm = this.fb.group({

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
    private fileManagerService: FileManagerService
  ) { }


  updateNcryptsec(password: string): void {
    const { nostrSecret } = this.generateNostrSecretForm.getRawValue();
    const decoded = nip19.decode(nostrSecret || '');
    const bytes = decoded.data as Uint8Array; 

    this.ncryptsec = nip49.encrypt(bytes, password) as TNcryptsec;
  }

  getFormControlErrors(fieldName: TEncryptNostrSecretFields): ValidationErrors | null {    
    return this.generateNostrSecretForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: TEncryptNostrSecretFields, error: string): boolean {
    const errors = this.generateNostrSecretForm.controls[fieldName].errors || {};
    return errors[error] || false;
  }

  showErrors(fieldName: TEncryptNostrSecretFields): boolean {
    return this.submitted && !!this.generateNostrSecretForm.controls[fieldName].errors;
  }

  renderQRCode(): void {
    
  }

  onSubmit(): void {

  }
}
