import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TAuthModalSteps } from '../../../auth-modal-steps.type';
import { TRelayManagerSteps } from '../relay-manager-steps.type';
import { IRelayDetail } from './relay-detail.interface';

@Component({
  selector: 'nostr-relay-detail',
  templateUrl: './relay-detail.component.html',
  styleUrl: './relay-detail.component.scss'
})
export class RelayDetailComponent implements OnInit {

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  @Input()
  relayDetail!: string;

  loadedDetails: IRelayDetail | null = null;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    fetch(this.relayDetail.replace(/^ws/, 'http'), {
      headers: {
        Accept: 'application/nostr+json'
      }
    }).then(res => res.json())
      .then(details => this.loadedDetails = details);
  }
}
