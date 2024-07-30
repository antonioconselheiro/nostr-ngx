import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { IRelayMetadata, MainPool, TRelayMetadataRecord } from '@belomonte/nostr-ngx';
import { NostrSigner } from '../../../../profile-service/nostr.signer';
import { TAuthModalSteps } from '../../../auth-modal-steps.type';
import { TRelayManagerSteps } from '../relay-manager-steps.type';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nostr-my-relays',
  templateUrl: './my-relays.component.html',
  styleUrl: './my-relays.component.scss'
})
export class MyRelaysComponent implements OnInit, OnDestroy {

  @Output()
  changeStep = new EventEmitter<TAuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  @Output()
  relayDetail = new EventEmitter<string>();

  connectionStatus = new Map<string, boolean>();
  choosenRelays: TRelayMetadataRecord = {};

  relaysFrom = 'public';
  relayWritable = true;
  relayReadable = true;

  newRelayError: 'never' | 'required' | null = null;

  private subscriptions = new Subscription();

  constructor(
    private mainPool: MainPool,
    private nostrSigner: NostrSigner
  ) { }

  ngOnInit(): void {
    this.mainPoolSubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
  
  private unsubscribe(): void {
    this.subscriptions.unsubscribe();
  }

  private mainPoolSubscribe(): void {
    const subscription = this.mainPool
      .observeConnection()
      .subscribe(() => this.updateConnectionStatus());

    this.subscriptions.add(subscription);
  }

  private updateConnectionStatus(): void {
    this.choosenRelays = this.mainPool.relays;
    this.connectionStatus = this.mainPool.listConnectionStatus();
  }

  // TODO: review this in internacionalization
  getNewRelayFieldLabel(): string {
    if (this.relayReadable && !this.relayWritable) {
      return 'New readonly relay';
    } else if (!this.relayReadable && this.relayWritable) {
      return 'New writeonly relay';
    } else {
      return 'New relay';
    }
  }

  listRelays(): Array<IRelayMetadata> {
    return Object
      .keys(this.choosenRelays)
      .map(relay => this.choosenRelays[relay]);
  }

  removeRelay(relay: string): void {
    this.mainPool.close([relay]);
  }

  connect(relay: string): void {
    if (!this.relayWritable && !this.relayReadable) {
      this.newRelayError = 'never';
    } else if (relay) {
      this.mainPool.ensureRelay(relay, {
        read: this.relayReadable,
        write: this.relayWritable
      });
      this.newRelayError = null;
    } else {
      this.newRelayError = 'required';
    }
  }

  disconnectAll(): void {
    this.mainPool.destroy();
  }
}
