import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { TCreateNostrSecret } from './create-nostr-secret-fields.type';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-create-nostr-secret',
  templateUrl: './create-nostr-secret.component.html'
})
export class CreateNostrSecretComponent implements OnInit {

  readonly passwordLength = 32;

  showNostrSecret = true;
  showPassword = false;
  showRepeatPassword = false;
  submitted = false;

  qrcode = '';

  generateNostrSecretForm = this.fb.group({
    nostrSecret: ['', [
      Validators.required.bind(this)
    ]],

    password: ['', [
      Validators.required.bind(this)
    ]],

    ncryptsec: [''],

    authenticate: [ true ]
  });

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    
  }

  getFormControlErrors(fieldName: TCreateNostrSecret): ValidationErrors | null {    
    return (this.generateNostrSecretForm.controls  as any )[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: TCreateNostrSecret, error: string): boolean {
    const errors = (this.generateNostrSecretForm.controls as any)[fieldName].errors || {};
    return errors[error] || false;
  }

  showErrors(fieldName: TCreateNostrSecret): boolean {
    return this.submitted && !!(this.generateNostrSecretForm.controls as any)[fieldName].errors;
  }

  downloadQrcode(): void {
    
  }

  onSubmit(): void {

  }
}
