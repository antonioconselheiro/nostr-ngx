import { Component, EventEmitter, Output } from '@angular/core';
import { TAuthModalSteps } from '../auth-modal-steps.type';

@Component({
  selector: 'nostr-download-signer',
  templateUrl: './download-signer.component.html',
  styleUrl: './download-signer.component.scss'
})
export class DownloadSignerComponent {
  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();
}
