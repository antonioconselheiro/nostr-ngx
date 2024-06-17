import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { TCreateNostrSecret } from './create-nostr-secret-fields.type';
import { AuthModalSteps } from '../auth-modal-steps.type';
import { generateSecretKey, nip19 } from 'nostr-tools';
import { FileManagerService } from '../../file-manager/file-manager.service';
import { TNcryptsec } from '@belomonte/nostr-ngx';
import * as nip49 from 'nostr-tools/nip49';

@Component({
  selector: 'nostr-create-nostr-secret',
  templateUrl: './create-nostr-secret.component.html',
  styleUrl: './create-nostr-secret.component.scss'
})
export class CreateNostrSecretComponent implements OnInit {

  readonly passwordLength = 32;

  showNostrSecret = true;
  showPassword = false;
  showConfirmPassword = false;
  submitted = false;

  ncryptsec?: TNcryptsec;
  qrcode = '';

  generateNostrSecretForm = this.fb.group({
    nostrSecret: [ nip19.nsecEncode(generateSecretKey())],

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

  ngOnInit(): void {

  }

  generateNostrSecret(): void {
    const nostrSecret = nip19.nsecEncode(generateSecretKey());
    this.generateNostrSecretForm.patchValue({ nostrSecret });
  }

  getFormControlErrors(fieldName: TCreateNostrSecret): ValidationErrors | null {    
    return this.generateNostrSecretForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: TCreateNostrSecret, error: string): boolean {
    const errors = this.generateNostrSecretForm.controls[fieldName].errors || {};
    return errors[error] || false;
  }

  showErrors(fieldName: TCreateNostrSecret): boolean {
    return this.submitted && !!this.generateNostrSecretForm.controls[fieldName].errors;
  }

  updateNcryptsec(password: string): void {
    const { nostrSecret } = this.generateNostrSecretForm.getRawValue();
    const decoded = nip19.decode(nostrSecret || '');
    const bytes = decoded.data as Uint8Array; 

    this.ncryptsec = nip49.encrypt(bytes, password) as TNcryptsec;
  }

  renderQRCode(): void {
    
  }

  onSubmit(): void {

  }

  downloadQrcode(): void {
    this.generateNostrSecretForm.getRawValue();
    //this.fileManagerService.save();
  }
}
