import { Injectable } from '@angular/core';
import { NSchema as n, NostrMetadata } from '@nostrify/nostrify';
import { kinds, nip19 } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { Nip05 } from "nostr-tools/nip05";
import { Ncryptsec, NProfile, NPub, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountCalculated } from '../domain/account/account-calculated.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountState } from '../domain/account/account-state.type';
import { AccountViewable } from '../domain/account/account-viewable.interface';
import { Account } from '../domain/account/account.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { FileManagerService } from '../nostr-media/file-manager.service';
import { NostrConverter } from '../nostr-utils/nostr.converter';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { NSecCrypto } from '../nostr-utils/nsec.crypto';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { AccountFactory } from './account.factory';
import { Nip05Proxy } from './nip05.proxy';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { AccountCacheable } from '../domain/account/compose/account-cacheable.type';

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
   * load one account from pool or from the cache the metadata and relay configs,
   * if loaded from pool, it will be added to cache
   */
  loadAccount(pubkey: HexString, minimalState: 'notloaded', opts?: NPoolRequestOptions): Promise<AccountCalculated | AccountEssential | AccountPointable | AccountViewable | AccountComplete>;
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

    const calculated = this.accountFactory.accountNotLoadedFactory(pubkey);
    if (minimalState === 'notloaded') {
      return calculated;
    }

    const essential = await this.loadAccountEssential(calculated, opts);
    if (minimalState === 'essential') {
      return essential;
    }

    const pointable = await this.loadAccountPointable(essential);
    if (minimalState === 'pointable') {
      return pointable;
    }

    const viewable = await this.loadAccountViewable(pointable);
    if (minimalState === 'viewable') {
      return viewable;
    }

    return this.loadAccountComplete(viewable);
  }

  /**
   * load events related to pubkey and compose one account object
   * this account contains: pubkey + relay + metadata
   */
  async loadAccountEssential(account: AccountCalculated, opts?: NPoolRequestOptions): Promise<AccountEssential> {
    const events = await this.profileNostr.loadProfileConfig(account.pubkey, opts);
    const relayRecord = this.relayConverter.convertEventsToRelayConfig(events);
    const metadataRecord = this.getProfileMetadata(events);
    const metadata = metadataRecord[account.pubkey] || null;
    const relays = relayRecord[account.pubkey] || {};

    const essential = this.accountFactory.factory(account.pubkey, metadata, relays);
    await this.profileCache.add([essential]);
    return essential;
  }

  /**
   * load events related to pubkey and load nip05, then compose one account object
   * this account contains: pubkey + relay + metadata + nip05
   */
  async loadAccountPointable(account: AccountEssential): Promise<AccountPointable> {
    const nip05 = await this.nip05Proxy.queryProfile(account.metadata?.nip05 as Nip05);
    const pointable = this.accountFactory.accountPointableFactory(account, nip05);

    await this.profileCache.add([pointable]);
    return pointable;
  }

  /**
   * load events related to pubkey, load nip05 and profile image, then compose one account object
   * this account contains: pubkey + relay + metadata + nip05 + profile image base64
   */
  async loadAccountViewable(account: AccountPointable): Promise<AccountViewable> {
    let profileBase64: string | null = null;

    if (account.metadata?.picture) {
      profileBase64 = await this.fileManagerService.linkToBase64(account.metadata.picture);
    }

    const viewable = this.accountFactory.accountViewableFactory(account, profileBase64);
    await this.profileCache.add([viewable]);
    return viewable;
  }

  /**
   * load every possible info to compose one account, including banner
   * this account contains: pubkey + relay + metadata + nip05 + profile image base64 + banner image base64
   */
  async loadAccountComplete(account: AccountViewable): Promise<AccountComplete> {
    let bannerBase64: string | null = null;
    if (account.metadata?.banner) {
      bannerBase64 = await this.fileManagerService.linkToBase64(account.metadata.banner);
    }

    const complete = this.accountFactory.accountCompleteFactory(account, bannerBase64);
    await this.profileCache.add([complete]);
    return complete;
  }

  /**
   * load completelly the account and make it authenticable,
   * accepts nsec + password or nsec + ncryptsec
   * this account contains: pubkey + relay + metadata + nip05 + profile image base64 + banner image base64 + ncryptsec
   */
  loadAccountAuthenticableFromNSec(nsec: NSec, password: string): Promise<AccountAuthenticable>;
  loadAccountAuthenticableFromNSec(nsec: NSec, ncryptsec: Ncryptsec): Promise<AccountAuthenticable>;
  async loadAccountAuthenticableFromNSec(nsec: NSec, cipherParam: string): Promise<AccountAuthenticable> {
    let ncryptsec: Ncryptsec;
    const publics = this.nostrConverter.convertNSecToPublicKeys(nsec);

    if (this.guard.isNcryptsec(cipherParam)) {
      ncryptsec = cipherParam;
    } else {
      ncryptsec = this.nsecCrypto.encryptNSec(nsec, cipherParam);
    }

    const complete = await this.loadAccount(publics.pubkey, 'complete');
    return this.loadAccountAuthenticable(complete, ncryptsec);
  }

  /**
   * load completelly the account and make it authenticable,
   * accepts pubkey + ncryptsec
   * this account contains: pubkey + relay + metadata + nip05 + profile image base64 + banner image base64 + ncryptsec
   */
  async loadAccountAuthenticable(account: AccountComplete, ncryptsec: Ncryptsec): Promise<AccountAuthenticable> {
    return this.accountFactory.accountAuthenticableFactory(account, ncryptsec);
  }
  
  private getProfileMetadata(events: Array<NostrEvent<number>>): { [pubkey: HexString]: NostrMetadata } {
    const record: { [pubkey: HexString]: NostrMetadata } = {};
    events
      .filter((event): event is NostrEvent<Metadata> => this.guard.isKind(event, kinds.Metadata))
      .forEach(event => {
        record[event.pubkey] = n
        .json()
        .pipe(n.metadata())
        .parse(event.content);
      });

    return record;
  }

  loadAccountUsingNPub(npub: NPub, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Account> {
    const { data } = nip19.decode(npub);
    return this.loadAccount(data, minimalState, opts);
  }

  loadAccountUsingNProfile(nprofile: NProfile, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Account> {
    const { data } = nip19.decode(nprofile);
    opts = opts || {};
    opts.include = opts.include ? [...opts.include, data] : [data];
    return this.loadAccount(data.pubkey, minimalState, opts);
  }

  loadAccounts(pubkeys: Array<HexString>, minimalState: 'notloaded', opts?: NPoolRequestOptions): Promise<Array<Account>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: 'essential', opts?: NPoolRequestOptions): Promise<Array<AccountCacheable>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: 'pointable', opts?: NPoolRequestOptions): Promise<Array<AccountPointable | AccountViewable | AccountComplete>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: 'viewable', opts?: NPoolRequestOptions): Promise<Array<AccountViewable | AccountComplete>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: 'complete', opts?: NPoolRequestOptions): Promise<Array<AccountComplete>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Array<Account>>;
  async loadAccounts(pubkeys: Array<HexString>, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    const accounts = this.readCache(pubkeys, opts);
    if (minimalState === 'notloaded') {
      return accounts;
    }

    const accountsWithEssentialInfo = await this.patchAccountsToEssential(accounts);
    if (minimalState === 'essential') {
      return accountsWithEssentialInfo;
    }

    const accountsWithPointableInfo = await this.patchAccountsToPointable(accountsWithEssentialInfo);
    if (minimalState === 'pointable') {
      return accountsWithPointableInfo;
    }
    
    const accountsWithViewableInfo = await this.patchAccountsToViewable(accountsWithPointableInfo);
    if (minimalState === 'viewable') {
      return accountsWithViewableInfo;
    }

    return this.patchAccountsToComplete(accountsWithViewableInfo);
  }

  readCache(pubkeys: Array<HexString>, opts?: NPoolRequestOptions): Array<Account> {
    return pubkeys.map(pubkey => {
      if (!opts || !opts.ignoreCache) {
        const account = this.profileCache.get(pubkey);
        if (account) {
          return account;
        }
      }

      return this.accountFactory.accountNotLoadedFactory(pubkey);
    });
  }

  async patchAccountsToEssential(accounts: Array<Account>, opts?: NPoolRequestOptions): Promise<Array<AccountEssential | AccountPointable | AccountViewable | AccountComplete>> {
    const notLoadedPubkeys = accounts
      .filter(account => account.state === 'notloaded')
      .map(account => account.pubkey);

    const events = await this.profileNostr.loadProfilesConfig(notLoadedPubkeys, opts);
    const relayRecord = this.relayConverter.convertEventsToRelayConfig(events);
    const metadataRecord = this.getProfileMetadata(events);

    const accountsRecord: { [pubkey: HexString]: AccountEssential | AccountPointable | AccountViewable | AccountComplete } = {};
    accounts.forEach(account => {
      if (account.state === 'notloaded') {
        const metadata = metadataRecord[account.pubkey] || null;
        const relays = relayRecord[account.pubkey] || {};

        account = this.accountFactory.accountEssentialFactory(account, metadata, relays);
        accountsRecord[account.pubkey] = account;
      } else {
        if (account.state === 'authenticable') {
          //  FIXME: maybe I should think about that
          console.warn('authenticable account identified in the cache, this data must be keep in local storage');
        }

        accountsRecord[account.pubkey] = account as any as AccountEssential | AccountPointable | AccountViewable | AccountComplete;
      }

    });

    return Object.values(accountsRecord);
  }

  async patchAccountsToPointable(accounts: Array<AccountCacheable>): Promise<Array<AccountPointable | AccountViewable | AccountComplete>> {
    const pointableAccounts = new Array<AccountPointable | AccountViewable | AccountComplete>();
    for await (const account of accounts) {
      if (account.state === 'essential') {
        const pointable = await this.loadAccountPointable(account);
        pointableAccounts.push(pointable);
      } else {
        pointableAccounts.push(account);
      }
    }

    return pointableAccounts;
  }

  async patchAccountsToViewable(accounts: Array<AccountPointable | AccountViewable | AccountComplete>): Promise<Array<AccountViewable | AccountComplete>> {
    const viewableAccounts = new Array<AccountViewable | AccountComplete>();
    for await (const account of accounts) {
      if (account.state === 'pointable') {
        const pointable = await this.loadAccountViewable(account);
        viewableAccounts.push(pointable);
      } else {
        viewableAccounts.push(account);
      }
    }

    return viewableAccounts;
  }

  async patchAccountsToComplete(accounts: Array<AccountViewable | AccountComplete>): Promise<Array<AccountComplete>> {
    const completeAccounts = new Array<AccountComplete>();
    for await (const account of accounts) {
      if (account.state === 'viewable') {
        const pointable = await this.loadAccountComplete(account);
        completeAccounts.push(pointable);
      } else {
        completeAccounts.push(account);
      }
    }

    return completeAccounts;
  }

  loadAccountsUsingNProfile(nprofiles: Array<NProfile>, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    const include: ProfilePointer[] = [];
    const pubkeys = nprofiles.map(nprofile => {
      const { data } = nip19.decode(nprofile);
      include.push(data);
      return data.pubkey;
    })
    opts = opts || {};
    opts.include = opts.include ? [...opts.include, ...include] : include;
    return this.loadAccounts(pubkeys, minimalState, opts);
  }

  // TODO: profile must listen current user public updates, so he don't needs f5 to update
  //listenUpdates(pubkeys: Array<string>, opts?: NPoolRequestOptions): Observable<Account> {
  //}

  /**
   * Include account to login later
   */
  addAccountAuthenticable(account: AccountAuthenticable): void {
    const local = this.localConfigs.read();
    if (!local.accounts) {
      local.accounts = {};
    }

    local.accounts[account.pubkey] = account;
    this.localConfigs.save(local);
  }

  /**
   * remove account from login
   */
  removeAccountAuthenticable(pubkey: HexString): void {
    const local = this.localConfigs.read();
    if (local.accounts) {
      delete local.accounts[pubkey];
    }

    this.localConfigs.save(local);
  }
}
