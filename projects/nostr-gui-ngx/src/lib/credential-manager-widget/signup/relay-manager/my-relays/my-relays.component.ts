import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { IRelayMetadata, MainPool, TRelayMetadataRecord } from '@belomonte/nostr-ngx';
import { NostrSigner } from '../../../../../../../nostr-ngx/src/lib/profile/nostr.signer';
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

  formatRelayMetadata(metadata: IRelayMetadata): string {
    if (metadata.write && metadata.read) {
      return `${metadata.url} (read/write)`;
    } else if (metadata.write) {
      return `${metadata.url} (write)`;
    } else if (metadata.read) {
      return `${metadata.url} (read)`;
    }

    return metadata.url;
  }

  listRelays(): Array<IRelayMetadata> {
    return Object
      .keys(this.choosenRelays)
      .map(relay => this.choosenRelays[relay]);
  }

  removeRelay(relay: string): void {
    this.mainPool.close([relay]);
  }

  onPasteRelays(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    if (clipboardData) {
      const relays = clipboardData.getData('text');
      if (/[\n;,]/.test(relays)) {
        event.preventDefault();
        event.stopPropagation();

        relays.split(/[,;\n]/).map(relay => this.connect({ value: relay.trim() }));
      }
    }
  }

  connect(el: { value: string }): void {
    const relay = el.value;
    if (!relay) {
      this.newRelayError = 'required';
      return;
    } else if (!this.relayWritable && !this.relayReadable) {
      this.newRelayError = 'never';
      return;
    }

    this.newRelayError = null;
    el.value = '';
    this.mainPool.ensureRelay(relay, {
      read: this.relayReadable,
      write: this.relayWritable
    });
  }

  disconnectAll(): void {
    this.mainPool.destroy();
  }
}
