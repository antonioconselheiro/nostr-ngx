import { Injectable } from '@angular/core';
import { kinds, nip19 } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { NProfile, NPub, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Account } from '../domain/account/account.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { NostrConverter } from '../nostr-utils/nostr.converter';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { NSecCrypto } from '../nostr-utils/nsec.crypto';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { AccountFactory } from './account.factory';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountState } from '../domain/account/account-state.type';
import { AccountNotLoaded } from '../domain/account/account-not-loaded.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountViewable } from '../domain/account/account-viewable.interface';
import { Nip05Proxy } from './nip05.proxy';
import { NSchema as n, NostrMetadata } from '@nostrify/nostrify';
import { Nip05 } from "nostr-tools/nip05";
import { FileManagerService } from '../nostr-media/file-manager.service';

//  TODO: a classe precisa ter um mecanismo para receber atualizações de informações e configurações de perfil
//  mas como saber quais perfis devem ter suas atualizações escutadas? O programador que estiver utilizando a
//  biblioteca deverá entregar a lista de perfis que devem ser escutados?

/**
 * You should use this class always when you need load users metadata, nip5, relays config events.
 * This service will control the cache and the interaction with relays.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileProxy {

  constructor(
    private guard: NostrGuard,
    private nip05Proxy: Nip05Proxy,
    private nsecCrypto: NSecCrypto,
    private profileCache: ProfileCache,
    private profileNostr: ProfileNostr,
    private relayConverter: RelayConverter,
    private nostrConverter: NostrConverter,
    private localConfigs: AccountsLocalStorage,
    private accountFactory: AccountFactory,
    private fileManagerService: FileManagerService
  ) { }

  /**
   * load from pool or from the cache the metadata and relay configs,
   * if loaded from pool, it will be added to cache
   */
  loadAccount(pubkey: HexString, minimalState: 'notloaded', opts?: NPoolRequestOptions): Promise<AccountNotLoaded | AccountEssential | AccountPointable | AccountViewable | AccountComplete>;
  loadAccount(pubkey: HexString, minimalState: 'essential', opts?: NPoolRequestOptions): Promise<AccountEssential | AccountPointable | AccountViewable | AccountComplete>;
  loadAccount(pubkey: HexString, minimalState: 'pointable', opts?: NPoolRequestOptions): Promise<AccountPointable | AccountViewable | AccountComplete>;
  loadAccount(pubkey: HexString, minimalState: 'viewable', opts?: NPoolRequestOptions): Promise<AccountViewable | AccountComplete>;
  loadAccount(pubkey: HexString, minimalState: 'complete', opts?: NPoolRequestOptions): Promise<AccountComplete>;
  loadAccount(pubkey: HexString, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Account>;
  async loadAccount(pubkey: HexString, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Account> {
    if (!opts || !opts.ignoreCache) {
      const account = this.profileCache.get(pubkey);
      if (account) {
        return account;
      }
    }

    if (minimalState === 'essential') {
      return this.loadAccountEssential(pubkey, opts);
    } else if (minimalState === 'pointable') {
      return this.loadAccountPointable(pubkey, opts);
    } else if (minimalState === 'viewable') {
      return this.loadAccountViewable(pubkey, opts);
    } else if (minimalState === 'complete') {
      return this.loadAccountComplete(pubkey, opts);
    }

    return this.accountFactory.accountNotLoadedFactory(pubkey);
  }

  /**
   * load events related to pubkey and compose account object
   * pubkey + relay + metadata
   */
  async loadAccountEssential(pubkey: HexString, opts?: NPoolRequestOptions): Promise<AccountEssential> {
    const events = await this.profileNostr.loadProfileConfig(pubkey, opts);
    const record = this.relayConverter.convertEventsToRelayConfig(events);
    const metadata = this.getProfileMetadata(events);

    return this.accountFactory.accountEssentialFactory(pubkey, metadata, record[pubkey] || {});
  }

  /**
   * load events related to pubkey and load nip05, then compose account object
   * pubkey + relay + metadata + nip05
   */
  async loadAccountPointable(pubkey: HexString, opts?: NPoolRequestOptions): Promise<AccountPointable> {
    const accountEssential = await this.loadAccountEssential(pubkey, opts);
    const nip05 = await this.nip05Proxy.queryProfile(accountEssential.metadata?.nip05 as Nip05);

    return this.accountFactory.accountPointableFactory(accountEssential, nip05);
  }

  /**
   * load events related to pubkey, load nip05 and profile image, then compose account object
   * pubkey + relay + metadata + nip05 + profile image base64
   */
  async loadAccountViewable(pubkey: HexString, opts?: NPoolRequestOptions): Promise<AccountViewable> {
    const accountPointable = await this.loadAccountPointable(pubkey, opts);
    let profileBase64: string | null = null;

    if (accountPointable.metadata?.picture) {
      profileBase64 = await this.fileManagerService.linkToBase64(accountPointable.metadata.picture);
    }

    return this.accountFactory.accountViewableFactory(accountPointable, profileBase64);
  }

  /**
   * load every possible info to compose account, including banner
   * pubkey + relay + metadata + nip05 + profile image base64 + banner image base64
   */
  async loadAccountComplete(pubkey: HexString, opts?: NPoolRequestOptions): Promise<AccountComplete> {
    let bannerBase64: string | null = null;
    const accountViewable = await this.loadAccountViewable(pubkey, opts);
    if (accountViewable.metadata?.banner) {
      bannerBase64 = await this.fileManagerService.linkToBase64(accountViewable.metadata.banner);
    }

    return this.accountFactory.accountCompleteFactory(accountViewable, bannerBase64);
  }

  private getProfileMetadata(events: Array<NostrEvent<number>>): NostrMetadata | null {
    const eventMetadata = events.find((event): event is NostrEvent<Metadata> => this.guard.isKind(event, kinds.Metadata));
    if (!eventMetadata) {
      return null;
    }

    return n
      .json()
      .pipe(n.metadata())
      .parse(eventMetadata.content);
  }

  /**
   * load every possible info to compose account object and include a ncryptsec
   * pubkey + relay + metadata + nip05 + profile image base64 + banner image base64 + ncryptsec
   */
  async loadAccountUnauthenticated(pubkey: HexString, opts?: NPoolRequestOptions): Promise<AccountAuthenticable> {

  }

  async listAccounts(pubkeys: Array<HexString>, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    const events = await this.profileNostr.loadProfilesConfig(pubkeys, opts);
    const eventMetadataList = events
      .filter((event): event is NostrEvent<Metadata> => this.guard.isKind(event, kinds.Metadata));
    const resultsetList = await this.profileCache.add(eventMetadataList);
    const relayRecord: {
      [pubkey: HexString]: NostrUserRelays
    } = this.relayConverter.convertEventsToRelayConfig(events);

    const resultsetRecord: {
      [pubkey: HexString]: AccountResultset
    } = {};

    resultsetList.forEach(resultset => {
      if (resultsetRecord[resultset.pubkey]) {
        resultsetRecord[resultset.pubkey] = resultset;
      }
    });

    return Promise.all(pubkeys.map(pubkey => {
      const relays = relayRecord[pubkey];
      const resultset = resultsetRecord[pubkey];

      return this.accountFactory.accountFactory(
        pubkey, resultset, relays
      );
    }));
  }

  loadAccountUsingNPub(npub: NPub, opts?: NPoolRequestOptions): Promise<Account> {
    const { data } = nip19.decode(npub);
    return this.loadAccount(data, opts);
  }

  loadAccountUsingNProfile(nprofile: NProfile, opts?: NPoolRequestOptions): Promise<Account> {
    const { data } = nip19.decode(nprofile);
    opts = opts || {};
    opts.include = opts.include ? [...opts.include, data] : [data];
    return this.loadAccount(data.pubkey, opts);
  }

  listAccountsUsingNProfile(nprofiles: Array<NProfile>, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    const include: ProfilePointer[] = [];
    const pubkeys = nprofiles.map(nprofile => {
      const { data } = nip19.decode(nprofile);
      include.push(data);
      return data.pubkey;
    })
    opts = opts || {};
    opts.include = opts.include ? [...opts.include, ...include] : include;
    return this.listAccounts(pubkeys, opts);
  }

  // TODO: profile must listen current user public updates, so he don't needs f5 to update
  //listenUpdates(pubkeys: Array<string>, opts?: NPoolRequestOptions): Observable<Account> {
  //}

  /**
   * use this when you receive a kind 0 event that does not come from this service
   */
  cache(profiles: Array<NostrEvent<Metadata>>): Promise<Array<AccountResultset>> {
    return this.profileCache.add(profiles);
  }

  async loadAccountFromCredentials(nsec: NSec, password: string): Promise<AccountAuthenticable> {
    const user = this.nostrConverter.convertNsecToPublicKeys(nsec);
    const ncryptsec = this.nsecCrypto.encryptNSec(nsec, password);
    const account = await this.loadAccount(user.pubkey);

    return Promise.resolve({ ...account, ncryptsec, state: 'authenticable' });
  }

  /**
   * Include account to login later
   */
  addUnauthenticatedAccount(account: AccountAuthenticable): void {
    const local = this.localConfigs.read();
    if (!local.accounts) {
      local.accounts = {};
    }

    local.accounts[account.pubkey] = account;
    this.localConfigs.save(local);
  }

  removeUnauthenticatedAccount(pubkey: HexString): void {
    const local = this.localConfigs.read();
    if (local.accounts) {
      delete local.accounts[pubkey];
    }

    this.localConfigs.save(local);
  }
}
