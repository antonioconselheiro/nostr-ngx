import { Component, EventEmitter, Output } from '@angular/core';
import { AuthModalSteps } from '../../auth-modal-steps.type';

@Component({
  selector: 'nostr-create-nsec-and-ncryptsec',
  templateUrl: './create-nsec-and-ncryptsec.component.html',
  styleUrl: './create-nsec-and-ncryptsec.component.scss'
})
export class CreateNsecAndNcryptsecComponent {
  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();
}
