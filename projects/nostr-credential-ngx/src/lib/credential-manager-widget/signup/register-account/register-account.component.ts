import { Component, EventEmitter, Output } from '@angular/core';
import { TAuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-register-account',
  templateUrl: './register-account.component.html'
})
export class RegisterAccountComponent {
  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();
}
