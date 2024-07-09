import { Component, EventEmitter, Output } from '@angular/core';
import { TRelayRecord, IRelayConfig } from '@belomonte/nostr-ngx';
import { NostrSigner } from '../../../../profile-service/nostr.signer';
import { TAuthModalSteps } from '../../../auth-modal-steps.type';
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

  @Output()
  relayDetail = new EventEmitter<string>();

  choosingRelays: TRelayRecord = {};
  relaysFrom = 'public';
  relayWritable = true;

  constructor(
    private nostrSigner: NostrSigner
  ) { }

  listRelays(): Array<IRelayConfig> {
    return Object
      .keys(this.choosingRelays)
      .map(relay => this.choosingRelays[relay]);
  }

  removeRelay(relay: string): void {
    delete this.choosingRelays[relay];
  }

  connect(relay: string): void {
    if (relay) {
      this.choosingRelays[relay] = {
        url: relay,
        read: true,
        write: this.relayWritable
      };
    }
  }
}
