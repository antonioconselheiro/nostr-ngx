import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { NOSTR_CONFIG_TOKEN, NostrConfig, NostrPool, NostrSigner, RelayLocalConfigService } from '@belomonte/nostr-ngx';
import { kinds, NostrEvent } from 'nostr-tools';
import { RelayRecord } from 'nostr-tools/relay';
import { AuthModalSteps } from '../../../auth-modal-steps.type';
import { RelayManagerSteps } from '../relay-manager-steps.type';

/**
 * FIXME: I need a screen to show relay current connection status
 * FIXME: maybe I should include block relay list in this screen too... but not sure
 */
@Component({
  selector: 'nostr-my-relays',
  templateUrl: './my-relays.component.html',
  styleUrl: './my-relays.component.scss'
})
export class MyRelaysComponent implements OnInit {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<RelayManagerSteps>();

  @Output()
  relayDetail = new EventEmitter<string>();

  connectionStatus = new Map<string, boolean>();

  choosenRelays: RelayRecord = {};
  choosenPrivateDirectMessageRelays: Array<WebSocket['url']> = [];
  choosenSearchRelays: Array<WebSocket['url']> = [];

  relayType = 'readwrite';
  newRelayError: 'required' | null = null;

  knownRelays: Array<string> = [];
  filteredKnownRelays: Array<string> = [];
  extensionRelays: RelayRecord | null = null;

  constructor(
    private npool: NostrPool,
    private relayConfig: RelayLocalConfigService,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>,
    //  FIXME: tlvz essa tela deva exibir os relays no signer
    private nostrSigner: NostrSigner
  ) { }

  ngOnInit(): void {
    this.readUserRelays();
    this.loadKnownRelays();
    this.getRelaysFromExtensionSigner();
  }

  private getRelaysFromExtensionSigner(): void {
    if (this.nostrSigner.hasSignerExtension()) {
      this.nostrSigner
        .getRelaysFromExtensionSigner()
        .then(relays => this.extensionRelays = relays);
    }
  }

  private async readUserRelays(): Promise<void> {
    const user = await this.relayConfig.getCurrentUserRelays();
    if (user) {
      this.choosenRelays = user.general;
      this.choosenPrivateDirectMessageRelays = user.directMessage || [];
      this.choosenSearchRelays = user.search || [];
    }
  }
  
  private loadKnownRelays(): void {
    this.npool.query([
      {
        kinds: [ kinds.RecommendRelay ]
      }
    ]).then(events => {
      const knownRelays = events
        .map(event => this.castEventRecomendedRelayToRelay(event))
        .flat(2)
        .map(relay => relay.replace(/^wss?:\/\/|\/$/g, ''));

      this.knownRelays = [...new Set(knownRelays)].sort((a, b) => a.localeCompare(b));
    });
  }

  castEventRecomendedRelayToRelay(event: NostrEvent): string[] {
    if (/(127\.|umbrel.local|npub)/.test(event.content)) {
      return [];
    }

    if (/[ ]/.test(event.content)) {
      return Array.from(event.content.match(/wss:\/\/[^ ]+/g) || []);
    } else if (/\./.test(event.content)) {
      return [event.content.replace(/[^ ]*wss:\/\//, 'wss://')];
    }

    return [];
  }

  filterSuggestions(term: string): void {
    const maxSuggestions = 15;
    term = term.replace(/^w?s?s?:?\/?\/?/g, '');

    if (term.length) {
      const matches: string[] = [];
      for (let i = 0; i < this.knownRelays.length; i++) {
        if (new RegExp(term, 'i').test(this.knownRelays[i])) {
          matches.push(this.knownRelays[i]);
        }

        if (matches.length >= maxSuggestions) {
          break;
        }
      }

      this.filteredKnownRelays = matches;
    } else {
      this.filteredKnownRelays = [];
    }
  }

  // TODO: review this in internacionalization
  getNewRelayFieldLabel(): string {
    if (this.relayType === 'write') {
      return 'Writeonly outbox relay';
    } else if (this.relayType === 'read') {
      return 'Readonly inbox relay';
    } else if (this.relayType === 'readwrite') {
      return 'Read/Write relay';
    } else if (this.relayType === 'dm') {
      return 'Private direct message relay';
    } else if (this.relayType === 'search') {
      return 'Search relay';
    } else {
      return 'New relay';
    }
  }

  formatRelayMetadata(relay: string, record: {
    read?: boolean;
    write?: boolean;
    dm?: true;
    search?: true;
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

  hasRelayInExtension(): boolean {
    if (!this.extensionRelays) {
      return false;
    }

    return !!Object.keys(this.extensionRelays).length;
  }

  listExtensionRelays(): Array<[ string, { read: boolean; write: boolean; } ]> {
    if (!this.extensionRelays) {
      return [];
    }

    return Object
      .keys(this.extensionRelays)
      .map(relay => [ relay, this.choosenRelays[relay] ]);
  }

  hasRelays(): boolean {
    return !!Object.keys(this.choosenRelays).length;
  }

  listDefaultRelays(): Array<[ string, { read: boolean; write: boolean; } ]> {
    console.info('this.nostrConfig.defaultFallback', this.nostrConfig.defaultFallback);
    return Object
      .keys(this.nostrConfig.defaultFallback)
      .map(relay => [ relay, this.choosenRelays[relay] ]);
  }

  listRelays(): Array<[ string, { read: boolean; write: boolean; } ]> {
    return Object
      .keys(this.choosenRelays)
      .map(relay => [ relay, this.choosenRelays[relay] ]);
  }

  removeRelay(relay: string): void {
    delete this.choosenRelays[relay];
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
    }

    this.newRelayError = null;
    el.value = '';

    if (this.relayType === 'write') {
      this.choosenRelays[relay] = { write: true, read: false };
    } else if (this.relayType === 'read') {
      this.choosenRelays[relay] = { write: false, read: true };
    } else if (this.relayType === 'readwrite') {
      this.choosenRelays[relay] = { write: true, read: true };
    } else if (this.relayType === 'dm') {
      this.choosenPrivateDirectMessageRelays.push(relay);
    } else if (this.relayType === 'search') {
      this.choosenSearchRelays.push(relay);
    }
  }
}
