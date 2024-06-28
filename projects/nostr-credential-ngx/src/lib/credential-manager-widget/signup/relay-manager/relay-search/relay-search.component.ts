import { Component, EventEmitter, Output } from '@angular/core';
import { TAuthModalSteps } from '../../../auth-modal-steps.type';
import { TRelayManagerSteps } from '../relay-manager-steps.type';

@Component({
  selector: 'nostr-relay-search',
  templateUrl: './relay-search.component.html',
  styleUrl: './relay-search.component.scss'
})
export class RelaySearchComponent {

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  @Output()
  relayDetail = new EventEmitter<string>();
}
