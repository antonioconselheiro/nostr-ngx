import { Component, EventEmitter, Output } from '@angular/core';
import { TRelayMap } from '@belomonte/nostr-ngx';
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

  choosingRelays: TRelayMap = {};
  relaysFrom = 'public';
  relayWritable = true;

  constructor(
    private nostrSigner: NostrSigner
  ) { }

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
    if (relay) {
      this.choosingRelays[relay] = {
        read: true,
        write: this.relayWritable
      };
    }
  }
}
