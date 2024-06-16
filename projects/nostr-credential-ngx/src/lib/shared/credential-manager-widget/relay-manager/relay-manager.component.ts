import { Component, EventEmitter, Output } from '@angular/core';
import { AuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-relay-manager',
  templateUrl: './relay-manager.component.html'
})
export class RelayManagerComponent {
  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();
}
