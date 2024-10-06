import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { NOSTR_CONFIG_TOKEN, NostrConfig, NostrPool, NostrSigner, RelayLocalConfigService, ProfileEventFactory, NostrUserRelays } from '@belomonte/nostr-ngx';
import { kinds, NostrEvent } from 'nostr-tools';
import { RelayRecord } from 'nostr-tools/relay';
import { AuthModalSteps } from '../../../auth-modal-steps.type';
import { RelayManagerSteps } from '../relay-manager-steps.type';
import { normalizeURL } from 'nostr-tools/utils';
import { RelayConfig } from './relay-config.interface';

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

  unsavedChosen: NostrUserRelays = {};

  relayType = 'readwrite';
  newRelayError: 'required' | null = null;

  knownRelays: Array<string> = [];
  filteredKnownRelays: Array<string> = [];
  extensionRelays: RelayRecord | null = null;

  constructor(
    private npool: NostrPool,
    private nostrSigner: NostrSigner,
    private profileEventFactory: ProfileEventFactory,
    private relayConfig: RelayLocalConfigService,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
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
      this.unsavedChosen = user;
    }
  }

  private loadKnownRelays(): void {
    this.npool.query([
      {
        kinds: [kinds.RecommendRelay]
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

  formatRelayMetadata(relay: string, config: RelayConfig): string {
    const types: string[] = [];
    if (config.read) {
      types.push('read');
    }

    if (config.write) {
      types.push('write');
    }

    if (config.dm) {
      types.push('dm');
    }

    if (config.search) {
      types.push('search');
    }

    return `${relay} (${types.join('/')})`;
  }

  hasRelayInExtension(): boolean {
    if (!this.extensionRelays) {
      return false;
    }

    return !!Object.keys(this.extensionRelays).length;
  }

  listExtensionRelays(): Array<[string, { read: boolean; write: boolean; }]> {
    const extension = this.extensionRelays;
    if (!extension) {
      return [];
    }

    return Object
      .keys(extension)
      .map(relay => [relay, extension[relay]]);
  }

  private hasMainRelayList(): boolean {
    return this.unsavedChosen.general && !!Object.keys(this.unsavedChosen.general).length;
  }

  hasRelays(): boolean {
    const mainRelayList = this.hasMainRelayList();
    const hasDm = !!this.unsavedChosen.directMessage?.length;
    const hasSearch = !!this.unsavedChosen.search?.length;

    return (mainRelayList || hasDm || hasSearch);
  }

  listRelays(): Array<[string, RelayConfig]> {
    const configs: { [relay: WebSocket['url']]: RelayConfig } = {};
    const general = this.unsavedChosen.general;
    if (this.hasMainRelayList() && general) {
      Object
        .keys(general)
        .forEach(relay => configs[relay] = general[relay]);
    } else {
      const defaultFallback = this.nostrConfig.defaultFallback;
      Object
        .keys(defaultFallback)
        .forEach(relay => configs[relay] = {
          default: true,
          ...defaultFallback[relay]
        });
    }

    this.unsavedChosen.directMessage?.forEach(relay => {
      configs[relay] = configs[relay] ? configs[relay] : {};
      configs[relay].dm = true;
    });

    this.unsavedChosen.search?.forEach(relay => {
      configs[relay] = configs[relay] ? configs[relay] : {};
      configs[relay].search = true;
    });

    return Object.keys(configs).map(relay => [relay, configs[relay]])
  }

  removeRelay(relay: string): void {
    if (this.unsavedChosen.general) {
      delete this.unsavedChosen.general[relay];
    }

    const notFound = -1;
    let index = -1;
    if (this.unsavedChosen.directMessage) {
      index = this.unsavedChosen.directMessage.indexOf(relay);
      if (index !== notFound) {
        this.unsavedChosen.directMessage.splice(index, 1);
      }
    }

    if (this.unsavedChosen.search) {
      index = this.unsavedChosen.search.indexOf(relay);
      if (index !== notFound) {
        this.unsavedChosen.search.splice(index, 1);
      }
    }
  }

  onPasteRelays(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    const separators = /[\n;,]/;
    if (clipboardData) {
      const relays = clipboardData.getData('text');
      if (separators.test(relays)) {
        event.preventDefault();
        event.stopPropagation();

        relays
          .split(separators)
          .map(relay => this.connect({ value: relay.trim() }));
      }
    }
  }

  showRelaySuggestion(): boolean {
    return [
      'write', 'relay', 'readwrite'
    ].includes(this.relayType);
  }

  // eslint-disable-next-line complexity
  connect(el: { value: string }): void {
    const relay = normalizeURL(el.value);
    if (!relay) {
      this.newRelayError = 'required';
      return;
    }

    this.newRelayError = null;
    el.value = '';

    this.unsavedChosen.general = this.unsavedChosen.general ?? {};
    this.unsavedChosen.directMessage = this.unsavedChosen.directMessage ?? [];
    this.unsavedChosen.search = this.unsavedChosen.search ?? [];

    if (this.relayType === 'write') {
      this.unsavedChosen.general[relay] = { write: true, read: false };
    } else if (this.relayType === 'read') {
      this.unsavedChosen.general[relay] = { write: false, read: true };
    } else if (this.relayType === 'readwrite') {
      this.unsavedChosen.general[relay] = { write: true, read: true };
    } else if (this.relayType === 'dm') {
      this.unsavedChosen.directMessage.push(relay);
    } else if (this.relayType === 'search') {
      this.unsavedChosen.search.push(relay);
    }
  }

  async saveChosenRelays(): Promise<void> {
    let record: RelayRecord;
    if (this.hasMainRelayList()) {
      record = this.unsavedChosen.general;
    } else {
      record = this.nostrConfig.defaultFallback;
    }

    const relayListEvent = this.profileEventFactory.createRelayEvent(record);
    await this.npool.event(relayListEvent);
    if (this.unsavedChosen.directMessage?.length) {
      const privateDMRelayListEvent = this.profileEventFactory.createPrivateDirectMessageListEvent(this.unsavedChosen.directMessage);
      await this.npool.event(privateDMRelayListEvent);
    }

    if (this.unsavedChosen.search?.length) {
      const searchRelayListEvent = this.profileEventFactory.createSearchRelayListEvent(this.unsavedChosen.search);
      await this.npool.event(searchRelayListEvent);
    }

    this.changeStep.next('registerAccount');
    return Promise.resolve();
  }

  //  TODO: incluir mecanismo de loading que bloqueie todos os campos e botões
  async saveDefaultRelays(): Promise<void> {
    const { defaultFallback, searchFallback } = this.nostrConfig;

    const relayListEvent = this.profileEventFactory.createRelayEvent(defaultFallback);
    await this.npool.event(relayListEvent);

    if (searchFallback.length) {
      const searchRelayListEvent = this.profileEventFactory.createSearchRelayListEvent(searchFallback);
      await this.npool.event(searchRelayListEvent);
    }

    this.changeStep.next('registerAccount');
    return Promise.resolve();
  }
}
