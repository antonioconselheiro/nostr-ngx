import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TAuthModalSteps } from '../../../auth-modal-steps.type';
import { NostrSigner } from '../../../../profile-service/nostr.signer';
import { TRelayManagerSteps } from '../relay-manager-steps.type';
import { TRelayMap } from '@belomonte/nostr-ngx';

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

  choosingRelays: TRelayMap = {};

  myRelaysForm!: FormGroup<{
    relaysFrom: FormControl<string | null>;
    newRelay: FormControl<string | null>;
    newCacheRelay: FormControl<string | null>;
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
      newRelay: [''],
      newCacheRelay: ['']
    });
  }

  listRelays(): Array<{
    relay: string;
    read: boolean;
    write: boolean;
  }> {
    return Object
      .keys(this.choosingRelays)
      .map(relay => ({ ...this.choosingRelays[relay], relay }));
  }

  removeRelay(relay: string): void {
    delete this.choosingRelays[relay];
  }

  connect(relay: string): void {
    this.choosingRelays[relay] = {
      read: true,
      write: true
    };
  }

  connectCache(relay: string) {
    this.choosingRelays[relay] = {
      read: true,
      write: false
    };
  }
}
