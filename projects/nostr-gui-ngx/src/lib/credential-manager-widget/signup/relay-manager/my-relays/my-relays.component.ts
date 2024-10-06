import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NOSTR_CONFIG_TOKEN, NostrConfig, NostrPool, NostrSigner, RelayLocalConfigService, ProfileEventFactory, NostrUserRelays, ProfileSessionStorage } from '@belomonte/nostr-ngx';
import { kinds, NostrEvent } from 'nostr-tools';
import { RelayRecord } from 'nostr-tools/relay';
import { AuthModalSteps } from '../../../auth-modal-steps.type';
import { RelayManagerSteps } from '../relay-manager-steps.type';
import { normalizeURL } from 'nostr-tools/utils';
import { RelayConfig } from './relay-config.interface';
import { Observable, Subscription } from 'rxjs';

/**
 * FIXME: I need a screen to show relay current connection status
 * FIXME: maybe I should include block relay list in this screen too... but not sure
 * TODO: include message when showing relays are not from user, but from unsaved session
 * TODO: include message when user include more then 3 relays for write or read
 */
@Component({
  selector: 'nostr-my-relays',
  templateUrl: './my-relays.component.html',
  styleUrl: './my-relays.component.scss'
})
export class MyRelaysComponent implements OnInit, OnDestroy {

  @Output()
  changeStep = new EventEmitter<AuthModalSteps>();

  @Output()
  changeRelayStep = new EventEmitter<RelayManagerSteps>();

  @Output()
  relayDetail = new EventEmitter<string>();

  @Input()
  contextObservable!: Observable<unknown>;

  connectionStatus = new Map<string, boolean>();

  unsavedConfig: NostrUserRelays = {};

  relayType = 'readwrite';
  newRelayError: 'required' | null = null;

  knownRelays: Array<string> = [];
  filteredKnownRelays: Array<string> = [];
  extensionRelays: RelayRecord | null = null;

  private subscriptions = new Subscription();

  constructor(
    private npool: NostrPool,
    private nostrSigner: NostrSigner,
    private profileEventFactory: ProfileEventFactory,
    private profileSessionStorage: ProfileSessionStorage,
    private relayConfig: RelayLocalConfigService,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  ngOnInit(): void {
    this.readUserRelays();
    this.loadKnownRelays();
    this.getRelaysFromExtensionSigner();
    this.listenOnModalClose();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private listenOnModalClose(): void {
    this.subscriptions.add(
      this.contextObservable.subscribe(() => this.cleanFormStorage())
    );
  }

  private getRelaysFromExtensionSigner(): void {
    if (this.nostrSigner.hasSignerExtension()) {
      this.nostrSigner
        .getRelaysFromExtensionSigner()
        .then(relays => this.extensionRelays = relays);
    }
  }

  private async readUserRelays(): Promise<void> {
    const session = this.profileSessionStorage.read();
    if (session.unsaveRelayConfig) {
      this.unsavedConfig = session.unsaveRelayConfig;
      return Promise.resolve();
    }

    const user = await this.relayConfig.getCurrentUserRelays();
    if (user) {
      this.unsavedConfig = user;
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
    if (/(127\.|umbrel.local|npub|(\/[^ ]+){5})/.test(event.content)) {
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
    return this.unsavedConfig.general && !!Object.keys(this.unsavedConfig.general).length;
  }

  hasRelays(): boolean {
    const mainRelayList = this.hasMainRelayList();
    const hasDm = !!this.unsavedConfig.directMessage?.length;
    const hasSearch = !!this.unsavedConfig.search?.length;

    return (mainRelayList || hasDm || hasSearch);
  }

  listRelays(): Array<[string, RelayConfig]> {
    const configs: { [relay: WebSocket['url']]: RelayConfig } = {};
    const general = this.unsavedConfig.general;
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

    this.unsavedConfig.directMessage?.forEach(relay => {
      configs[relay] = configs[relay] ? configs[relay] : {};
      configs[relay].dm = true;
    });

    this.unsavedConfig.search?.forEach(relay => {
      configs[relay] = configs[relay] ? configs[relay] : {};
      configs[relay].search = true;
    });

    return Object.keys(configs).map(relay => [relay, configs[relay]])
  }

  removeRelay(relay: string): void {
    if (this.unsavedConfig.general) {
      delete this.unsavedConfig.general[relay];
    }

    const notFound = -1;
    let index = -1;
    if (this.unsavedConfig.directMessage) {
      index = this.unsavedConfig.directMessage.indexOf(relay);
      if (index !== notFound) {
        this.unsavedConfig.directMessage.splice(index, 1);
      }
    }

    if (this.unsavedConfig.search) {
      index = this.unsavedConfig.search.indexOf(relay);
      if (index !== notFound) {
        this.unsavedConfig.search.splice(index, 1);
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

    this.unsavedConfig.general = this.unsavedConfig.general ?? {};
    this.unsavedConfig.directMessage = this.unsavedConfig.directMessage ?? [];
    this.unsavedConfig.search = this.unsavedConfig.search ?? [];

    if (this.relayType === 'write') {
      this.unsavedConfig.general[relay] = { write: true, read: false };
    } else if (this.relayType === 'read') {
      this.unsavedConfig.general[relay] = { write: false, read: true };
    } else if (this.relayType === 'readwrite') {
      this.unsavedConfig.general[relay] = { write: true, read: true };
    } else if (this.relayType === 'dm') {
      this.unsavedConfig.directMessage.push(relay);
    } else if (this.relayType === 'search') {
      this.unsavedConfig.search.push(relay);
    }

    this.profileSessionStorage.patch({
      unsaveRelayConfig: this.unsavedConfig
    });
  }

  private cleanFormStorage(): void {
    this.profileSessionStorage.update(session => {
      delete session.unsaveRelayConfig;
      return session;
    });
  }

  cancel(): void {
    this.cleanFormStorage();
    //  FIXME: this could be not the first screen, accound to the situations
    this.changeStep.next('selectAccount');
  }

  async saveChosenRelays(): Promise<void> {
    let record: RelayRecord;
    if (this.hasMainRelayList()) {
      record = this.unsavedConfig.general;
    } else {
      record = this.nostrConfig.defaultFallback;
    }

    const relayListEvent = this.profileEventFactory.createRelayEvent(record);
    await this.npool.event(relayListEvent);
    if (this.unsavedConfig.directMessage?.length) {
      const privateDMRelayListEvent = this.profileEventFactory.createPrivateDirectMessageListEvent(this.unsavedConfig.directMessage);
      await this.npool.event(privateDMRelayListEvent);
    }

    if (this.unsavedConfig.search?.length) {
      const searchRelayListEvent = this.profileEventFactory.createSearchRelayListEvent(this.unsavedConfig.search);
      await this.npool.event(searchRelayListEvent);
    }

    this.cleanFormStorage();
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

    this.cleanFormStorage();
    this.changeStep.next('registerAccount');
    return Promise.resolve();
  }
}
