import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TAuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-register-account',
  templateUrl: './register-account.component.html',
  styleUrls: [ './register-account.component.scss' ]
})
export class RegisterAccountComponent implements OnInit {

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  submitted = false;

  registerAccount!: FormGroup<{
    displayName: FormControl<string | null>;
    picture: FormControl<string | null>;
    banner: FormControl<string | null>;
    bio: FormControl<string | null>;
    url: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerAccount = this.fb.group({
      displayName: [''],

      picture: [''],

      banner: [''],

      bio: [''],

      url: ['']
    })
  }

  onSubmit(): void {
    
  }
}
