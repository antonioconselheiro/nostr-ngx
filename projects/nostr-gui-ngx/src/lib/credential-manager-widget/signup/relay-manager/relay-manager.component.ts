import { Component, EventEmitter, Output } from '@angular/core';
import { TRelayManagerSteps } from './relay-manager-steps.type';
import { AuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-relay-manager',
  templateUrl: './relay-manager.component.html'
})
export class RelayManagerComponent {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  currentStep: TRelayManagerSteps = 'myRelays';

  relayDetail?: string;

  /**
   * which screen we are before come to detail?
   * this will help back button
   */
  backFromDetailOrigin?: TRelayManagerSteps;

  /**
   * TODO: tlvz esse parâmetro precise ficar centralizado
   * no serviço que controla o pool de relays
   */
  choosenRelays: string[] = [];

  showRelayDetail(relay: string): void {
    this.relayDetail = relay;
    this.backFromDetailOrigin = this.currentStep;
    this.currentStep = 'relayDetails';
  }

  backFromDetail(): void {
    if (this.backFromDetailOrigin) {
      this.currentStep = this.backFromDetailOrigin;
    }
  }
}
