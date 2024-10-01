import { Inject, Injectable } from "@angular/core";
import { kinds, nip19 } from "nostr-tools";
import { queryProfile } from "nostr-tools/nip05";
import { ProfilePointer } from "nostr-tools/nip19";
import { RelayRecord } from "nostr-tools/relay";
import { AccountsLocalStorage } from "../configs/accounts-local.storage";
import { NostrConfig } from "../configs/nostr-config.interface";
import { NostrUserRelays } from "../configs/nostr-user-relays.interface";
import { ProfileSessionStorage } from "../configs/profile-session.storage";
import { Nip05 } from "../domain/nip05.type";
import { NProfile } from "../domain/nprofile.type";
import { NPub } from "../domain/npub.type";
import { NOSTR_CONFIG_TOKEN } from "../injection-token/nostr-config.token";
import { NostrConverter } from "../nostr-utils/nostr.converter";
import { NostrGuard } from "../nostr-utils/nostr.guard";
import { RelayConverter } from "../nostr-utils/relay.converter";
import { NostrPool } from "./nostr.pool";
import { RelayLocalConfigService } from "./relay-local-config.service";
import { NPoolRequestOptions } from "./npool-request.options";

/**
 * this service offers all possibles ways to load a user relay config
 */
@Injectable({
  providedIn: 'root'
})
export class RelayPublicConfigService {

  //  FIXME: include correct kind when nostr-tools implements nip17.ts
  readonly kindDirectMessageRelayList = 10050;

  constructor(
    private guard: NostrGuard,
    private relayConverter: RelayConverter,
    private nostrConverter: NostrConverter,
    private configsLocal: AccountsLocalStorage,
    private configSession: ProfileSessionStorage,
    private relayLocalConfigService: RelayLocalConfigService,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>,
    private npool: NostrPool
  ) { }

  /**
   * load current user relays
   * after loaded, pool will be already configured to use it reading from cache
   * @returns user relays config, with outbox/inbox, dm relays, search relays
   */
  // eslint-disable-next-line complexity
  async loadCurrentUserRelays(): Promise<NostrUserRelays | null> {
    //  FIXME: TODO: TODOING: preciso revisar esse método inteiro
    //  o carremaneto de todas as configurações deve ser feito com um único método,
    //  com todas as entradas de endereço publicos possiveis (pubkey, npub, nprofile, nip5)
    const session = this.configSession.read(),
      local = this.configsLocal.read(),
      signer = local.signer;
    let directMessage: Array<WebSocket['url']> | null | undefined,
      search: Array<WebSocket['url']> | null | undefined,
      blocked: Array<WebSocket['url']> | null | undefined,
      general: RelayRecord | null | undefined = null,
      extensionRelays: RelayRecord | null = null;

    const userRelays = session.account?.relays;
    // const nip05 = session.account?.metadata?.nip05;
    const pubkey = local.currentPubkey;

    if (userRelays) {
      return Promise.resolve(userRelays);
    }

    if (signer === 'extension') {
      extensionRelays = await this.relayLocalConfigService.getRelaysFromExtensionSigner();
    }

    // if (this.guard.isNip05(nip05)) {
    //   general = await this.loadMainRelaysFromNIP5(nip05);
    // }

    if (pubkey) {
      //  FIXME: must join all in one filter
      general = await this.loadMainRelaysOnlyHavingPubkey(pubkey);
      directMessage = await this.loadRelayListOnlyHavingPubkey(pubkey, 10050);
      search = await this.loadRelayListOnlyHavingPubkey(pubkey, 10007);
      blocked = await this.loadRelayListOnlyHavingPubkey(pubkey, 10006);
    }

    general = this.relayLocalConfigService.mergeUserRelayConfigToExtensionRelays(general, extensionRelays);
    return Promise.resolve({
      general: general || undefined,
      blocked: blocked || undefined,
      directMessage: directMessage || undefined,
      search: search || undefined
    });
  }

  getUserPublicMainRelays(nprofile: NProfile, opts?: NPoolRequestOptions): Promise<NostrUserRelays | null>;
  getUserPublicMainRelays(nip5: Nip05, opts?: NPoolRequestOptions): Promise<NostrUserRelays | null>;
  getUserPublicMainRelays(npub: NPub, opts?: NPoolRequestOptions): Promise<NostrUserRelays | null>;
  getUserPublicMainRelays(pubkey: string, opts?: NPoolRequestOptions): Promise<NostrUserRelays | null>;
  async getUserPublicMainRelays(userPublicAddress: string, opts?: NPoolRequestOptions): Promise<NostrUserRelays | null> {
    if (this.guard.isNip05(userPublicAddress)) {
      return this.loadMainRelaysFromNIP5(userPublicAddress, opts);
    } else if (this.guard.isNPub(userPublicAddress)) {
      return this.loadMainRelaysOnlyHavingNpub(userPublicAddress, opts);
    } else if (this.guard.isNProfile(userPublicAddress)) {
      return this.loadMainRelaysFromNprofile(userPublicAddress, opts);
    } else if (this.guard.isHexadecimal(userPublicAddress)) {
      return this.loadMainRelaysOnlyHavingPubkey(userPublicAddress, opts);
    }

    return Promise.resolve(null);
  }

  async loadMainRelaysFromProfilePointer(pointer: ProfilePointer, opts?: NPoolRequestOptions): Promise<RelayRecord | null> {
    if (pointer.relays?.length) {
      const { pubkey } = pointer;
      opts = this.npool.mergeOptions(opts, {
        useOnly: pointer.relays
      });
      const [relayListEvent] = await this.npool.query([
        {
          kinds: [kinds.RelayList],
          authors: [pubkey],
          limit: 1
        }
      ], opts).catch(() => Promise.resolve([null]));

      if (this.guard.isKind(relayListEvent, kinds.RelayList)) {
        const record = this.relayConverter.convertRelayListEventToRelayRecord(relayListEvent);
        return Promise.resolve(record);
      }

      return this.loadMainRelaysOnlyHavingPubkey(pubkey);
    }

    return Promise.resolve(null);
  }

  async loadMainRelaysFromNprofile(nprofile: NProfile, opts?: NPoolRequestOptions): Promise<RelayRecord | null> {
    return this.loadMainRelaysFromProfilePointer(nip19.decode(nprofile).data, opts);
  }

  async loadMainRelaysFromNIP5(nip5: Nip05, opts?: NPoolRequestOptions): Promise<RelayRecord | null> {
    const pointer = await queryProfile(nip5);

    if (pointer) {
      return this.loadMainRelaysFromProfilePointer(pointer, opts);
    }

    return Promise.resolve(null);
  }

  async loadMainRelaysOnlyHavingNpub(npub: NPub, opts?: NPoolRequestOptions): Promise<RelayRecord | null> {
    const pubkey = this.nostrConverter.casNPubToPubkey(npub);
    return this.loadMainRelaysOnlyHavingPubkey(pubkey, opts);
  }

  async loadMainRelaysOnlyHavingPubkey(pubkey: string, opts?: NPoolRequestOptions): Promise<RelayRecord | null> {
    opts = this.npool.mergeOptions(opts, {
      include: this.nostrConfig.bestFor.findProfileConfig
    });

    const [relayListEvent] = await this.npool.query([
      {
        kinds: [kinds.RelayList],
        authors: [pubkey],
        limit: 1
      }
    ], opts).catch(() => Promise.resolve([null]));

    if (this.guard.isKind(relayListEvent, kinds.RelayList)) {
      const relayList = this.relayConverter.convertRelayListEventToRelayRecord(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve(null);
  }

  /**
   * @param userPublicAddress nip5, npub, nprofile or pubkey
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  getUserRelayList(userPublicAddress: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using NIP5.
   */
  getUserRelayList(nip5: Nip05, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using nprofile.
   */
  getUserRelayList(nprofile: NProfile, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user list of blocked relays, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10006): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for search, using NIP5.
   */
  getUserRelayList(nip5: Nip05, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using nprofile.
   */
  getUserRelayList(nprofile: NProfile, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10007): Promise<Array<WebSocket['url']> | null>;

  /**
   * @returns user configured relays for direct message, using NIP5.
   */
  getUserRelayList(nip5: Nip05, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using npub.
   */
  getUserRelayList(npub: NPub, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using nprofile.
   */
  getUserRelayList(nprofile: NProfile, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using hexadecimal pubkey.
   */
  getUserRelayList(pubkey: string, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  async getUserRelayList(userPublicAddress: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    if (this.guard.isNip05(userPublicAddress)) {
      return this.loadRelayListFromNIP5(userPublicAddress, kind);
    } else if (this.guard.isNPub(userPublicAddress)) {
      return this.loadRelayListOnlyHavingNpub(userPublicAddress, kind);
    } else if (this.guard.isNProfile(userPublicAddress)) {
      return this.loadRelayListFromNprofile(userPublicAddress, kind);
    } else if (this.guard.isHexadecimal(userPublicAddress)) {
      return this.loadRelayListOnlyHavingPubkey(userPublicAddress, kind);
    }

    return Promise.resolve(null);
  }

  /**
   * @returns user list of blocked relays, using ProfilePointer.
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using ProfilePointer.
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using ProfilePointer.
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param pointer ProfilePointer
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListFromProfilePointer(pointer: ProfilePointer, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    if (pointer.relays?.length) {
      const { pubkey } = pointer;
      const [directMessageRelayListEvent] = await this.npool.query([
        {
          kinds: [this.kindDirectMessageRelayList],
          authors: [pubkey],
          limit: 1
        }
      ], {
        useOnly: pointer.relays
      }).catch(() => Promise.resolve([null]));

      if (this.guard.isKind(directMessageRelayListEvent, this.kindDirectMessageRelayList)) {
        const relayList = this.relayConverter.convertRelayEventToRelayList(directMessageRelayListEvent);
        return Promise.resolve(relayList);
      }

      return this.loadRelayListOnlyHavingPubkey(pubkey, kind);
    }

    return Promise.resolve(null);
  }

  /**
   * @returns user list of blocked relays, using using nprofile.
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using using nprofile.
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using using nprofile.
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param nprofile using nprofile
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListFromNprofile(nprofile: NProfile, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListFromNprofile(nprofile: NProfile, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    return this.loadRelayListFromProfilePointer(nip19.decode(nprofile).data, kind);
  }

  /**
   * @returns user list of blocked relays, using NIP5.
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using NIP5.
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using NIP5.
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param nip5 using NIP5
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListFromNIP5(nip5: Nip05, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListFromNIP5(nip5: Nip05, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const pointer = await queryProfile(nip5);

    if (pointer) {
      return this.loadRelayListFromProfilePointer(pointer, kind);
    }

    return Promise.resolve(null);
  }

  /**
   * @returns user list of blocked relays, using npub.
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using npub.
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using npub.
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param nip5 using npub
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListOnlyHavingNpub(npub: NPub, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListOnlyHavingNpub(npub: NPub, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const pubkey = this.nostrConverter.casNPubToPubkey(npub);
    return this.loadRelayListOnlyHavingPubkey(pubkey, kind);
  }

  /**
   * @returns user list of blocked relays, using hexadecimal pubkey.
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10006): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for search, using hexadecimal pubkey.
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10007): Promise<Array<WebSocket['url']> | null>;
  /**
   * @returns user configured relays for direct message, using hexadecimal pubkey.
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10050): Promise<Array<WebSocket['url']> | null>;
  /**
   * @param pubkey using pubkey hexadecimal
   * @param kind the relay list kind: 10006, blocked relays list; 10007, relays to use for search; 10050, relays for direct message. 
   * @returns a user publically configured relay list
   */
  loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null>;
  async loadRelayListOnlyHavingPubkey(pubkey: string, kind: 10006 | 10007 | 10050): Promise<Array<WebSocket['url']> | null> {
    const [relayListEvent] = await this.npool.query([
      {
        kinds: [kind],
        authors: [pubkey],
        limit: 1
      }
    ], {
      include: this.nostrConfig.bestFor.findProfileConfig
    }).catch(() => Promise.resolve([null]));

    if (this.guard.isKind(relayListEvent, kind)) {
      const relayList = this.relayConverter.convertRelayEventToRelayList(relayListEvent);
      return Promise.resolve(relayList);
    }

    return Promise.resolve(null);
  }
}
