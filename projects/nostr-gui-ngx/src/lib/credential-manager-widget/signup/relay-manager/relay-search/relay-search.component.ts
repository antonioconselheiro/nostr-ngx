import { Component, EventEmitter, Output } from '@angular/core';
import { AuthModalSteps } from '../../../auth-modal-steps.type';
import { TRelayManagerSteps } from '../relay-manager-steps.type';

/**
 * Não é MVP
 */
@Component({
  selector: 'nostr-relay-search',
  templateUrl: './relay-search.component.html',
  styleUrl: './relay-search.component.scss'
})
export class RelaySearchComponent {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  @Output()
  relayDetail = new EventEmitter<string>();
}
