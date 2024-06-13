import { Component } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'nostr-create-nostr-secret',
  templateUrl: './create-nostr-secret.component.html',
  styleUrl: './create-nostr-secret.component.scss'
})
export class CreateNostrSecretComponent {

  showNostrSecret = true;
  showPassword = false;
  submitted = false;

  generateNostrSecretForm = this.fb.group({
    nostrSecret: ['', [
      Validators.required.bind(this)
    ]],

    nostrPublic: [''],

    password: ['', [
      Validators.required.bind(this)
    ]],

    ncryptsec: [''],
  });

  constructor(
    private fb: FormBuilder
  ) { }

  getFormControlErrors(fieldName: 'nostrSecret' | 'nostrPublic' | 'password' | 'ncryptsec'): ValidationErrors | null {    
    return this.generateNostrSecretForm.controls[fieldName].errors;
  }

  getFormControlErrorStatus(fieldName: 'nostrSecret' | 'nostrPublic' | 'password' | 'ncryptsec', error: string): boolean {
    const errors = this.generateNostrSecretForm.controls[fieldName].errors || {};
    return errors[error] || false;
  }

  onSubmit(): void {

  }
}
