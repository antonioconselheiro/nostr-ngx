import { Component, OnInit } from '@angular/core';
import { FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { TCreateNostrSecret } from './create-nostr-secret-fields.type';

@Component({
  selector: 'nostr-create-nostr-secret',
  templateUrl: './create-nostr-secret.component.html'
})
export class CreateNostrSecretComponent implements OnInit {

  readonly passwordLength = 32;

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

    authenticate: [ true ]
  });

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    
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

  onSubmit(): void {

  }
}
