import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RelayManagerSteps } from './relay-manager-steps.type';
import { AuthModalSteps } from '../../auth-modal-steps.type';
import { Observable } from 'rxjs';

@Component({
  selector: 'nostr-relay-manager',
  templateUrl: './relay-manager.component.html'
})
export class RelayManagerComponent {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Input()
  contextObservable!: Observable<unknown>;

  currentStep: RelayManagerSteps = 'myRelays';

  relayDetail?: string;

  /**
   * which screen we are before come to detail?
   * this will help back button
   */
  backFromDetailOrigin?: RelayManagerSteps;

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
