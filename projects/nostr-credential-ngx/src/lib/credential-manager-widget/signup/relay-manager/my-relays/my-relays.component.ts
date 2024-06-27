import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TAuthModalSteps } from '../../../auth-modal-steps.type';
import { NostrSigner } from '../../../../profile-service/nostr.signer';
import { TRelayManagerSteps } from '../relay-manager-steps.type';

@Component({
  selector: 'nostr-my-relays',
  templateUrl: './my-relays.component.html',
  styleUrl: './my-relays.component.scss'
})
export class MyRelaysComponent {

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  myRelaysForm!: FormGroup<{
    relaysFrom: FormControl<string | null>;
    newRelay: FormControl<string | null>;
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
      relaysFrom: ['public'],
      newRelay: ['']
    });
  }
}
