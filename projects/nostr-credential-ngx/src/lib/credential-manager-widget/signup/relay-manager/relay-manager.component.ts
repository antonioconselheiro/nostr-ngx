import { Component, EventEmitter, Output } from '@angular/core';
import { TRelayManagerSteps } from './relay-manager-steps.type';
import { TAuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-relay-manager',
  templateUrl: './relay-manager.component.html'
})
export class RelayManagerComponent {
  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  currentStep: TRelayManagerSteps = 'myRelays';
}
