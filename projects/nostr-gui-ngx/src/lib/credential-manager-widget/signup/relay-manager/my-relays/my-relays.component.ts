import { Component, EventEmitter, Output } from '@angular/core';
import { NostrPool, NostrSigner } from '@belomonte/nostr-ngx';
import { RelayRecord } from 'nostr-tools/relay';
import { AuthModalSteps } from '../../../auth-modal-steps.type';
import { TRelayManagerSteps } from '../relay-manager-steps.type';

/**
 * FIXME: this screen need to show relay current connection
 */
@Component({
  selector: 'nostr-my-relays',
  templateUrl: './my-relays.component.html',
  styleUrl: './my-relays.component.scss'
})
export class MyRelaysComponent {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<TRelayManagerSteps>();

  @Output()
  relayDetail = new EventEmitter<string>();

  connectionStatus = new Map<string, boolean>();
  choosenRelays: RelayRecord = {};

  relaysFrom = 'public';
  relayWritable = true;
  relayReadable = true;

  newRelayError: 'never' | 'required' | null = null;

  constructor(
    private npool: NostrPool,
    private nostrSigner: NostrSigner
  ) { }

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

  formatRelayMetadata(relay: string, record: {
    read: boolean;
    write: boolean;
  }): string {
    if (record.write && record.read) {
      return `${relay} (read/write)`;
    } else if (record.write) {
      return `${relay} (write)`;
    } else if (record.read) {
      return `${relay} (read)`;
    }

    return relay;
  }

  listRelays(): Array<[ string, { read: boolean; write: boolean; } ]> {
    return Object
      .keys(this.choosenRelays)
      .map(relay => [ relay, this.choosenRelays[relay] ]);
  }

  removeRelay(relay: string): void {
    //this.mainPool.close([relay]);
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
    //this.mainPool.ensureRelay(relay, {
    //  read: this.relayReadable,
    //  write: this.relayWritable
    //});
  }
}
