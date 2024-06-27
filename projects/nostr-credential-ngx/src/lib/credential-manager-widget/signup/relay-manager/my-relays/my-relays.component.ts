import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthModalSteps } from '../../../auth-modal-steps.type';
import { NostrSigner } from '../../../../profile-service/nostr.signer';

@Component({
  selector: 'nostr-my-relays',
  templateUrl: './my-relays.component.html',
  styleUrl: './my-relays.component.scss'
})
export class MyRelaysComponent {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  myRelaysForm!: FormGroup<{
    relaysFrom: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private nostrSigner: NostrSigner
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.myRelaysForm = this.fb.group({
      relaysFrom: ['']
    });
  }
}
