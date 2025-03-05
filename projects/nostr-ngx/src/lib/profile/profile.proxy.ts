import { Injectable } from '@angular/core';
import { NSchema as n, NostrMetadata } from '@nostrify/nostrify';
import { kinds, nip19 } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { Nip05 } from "nostr-tools/nip05";
import { Ncryptsec, NProfile, NPub, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountCalculated } from '../domain/account/account-calculated.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountRaw } from '../domain/account/account-raw.interface';
import { AccountState } from '../domain/account/account-state.type';
import { AccountOpenable } from '../domain/account/compose/account-openable.type';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { AccountSession } from '../domain/account/compose/account-session.type';
import { Account } from '../domain/account/compose/account.interface';
import { Base64String } from '../domain/base64-string.type';
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
  loadAccount(pubkey: HexString, minimalState: 'calculated', opts?: NPoolRequestOptions): Promise<Account>;
  loadAccount(pubkey: HexString, minimalState: 'essential', opts?: NPoolRequestOptions): Promise<AccountRenderable>;
  loadAccount(pubkey: HexString, minimalState: 'pointable', opts?: NPoolRequestOptions): Promise<AccountOpenable>;
  loadAccount(pubkey: HexString, minimalState: 'complete', opts?: NPoolRequestOptions): Promise<AccountSession>;
  loadAccount(pubkey: HexString, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Account>;
  async loadAccount(pubkey: HexString, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Account> {
    if (!opts || !opts.ignoreCache) {
      const account = this.profileCache.get(pubkey);
      if (account) {
        return account;
      }
    }

    const calculated = this.accountFactory.accountCalculatedFactory(pubkey);
    if (minimalState === 'calculated') {
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

    return this.loadAccountComplete(pointable);
  }

  /**
   * getAccount will never return null, because it will at least return the account calculated if the
   * account pubkey isn't in the cache.
   * 
   * getRawAccount will return just the pubkey with no calculations or cache checks, that can be
   * considered a lazy load version to avoid processing data when it is not necessary
   *
   * @param pubkey 
   * @returns 
   */
  getRawAccount(pubkey: HexString): AccountRaw {
    return {
      pubkey,
      npub: null,
      state: 'raw',
      displayName: null,
      nip05: null,
      pictureBase64: null,
      pictureUrl: null
    };
  }

  /**
   * return account from cache or return account in the 'calculated' state
   */
  getAccount(pubkey: HexString): Account {
    const account = this.profileCache.get(pubkey);
    if (account) {
      return account;
    }

    return this.accountFactory.accountCalculatedFactory(pubkey);
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
  async loadAccountComplete(account: AccountPointable): Promise<AccountComplete> {
    let profileBase64: Base64String | null = null;

    if (account.metadata?.picture) {
      profileBase64 = await this.fileManagerService.linkToBase64(account.metadata.picture);
    }

    const complete = this.accountFactory.accountCompleteFactory(account, profileBase64);
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
  async loadAccountAuthenticable(account: AccountSession, ncryptsec: Ncryptsec): Promise<AccountAuthenticable> {
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

  loadAccounts(pubkeys: Array<HexString>, minimalState: 'calculated', opts?: NPoolRequestOptions): Promise<Array<Account>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: 'essential', opts?: NPoolRequestOptions): Promise<Array<AccountRenderable>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: 'pointable', opts?: NPoolRequestOptions): Promise<Array<AccountPointable | AccountComplete>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: 'complete', opts?: NPoolRequestOptions): Promise<Array<AccountComplete>>;
  loadAccounts(pubkeys: Array<HexString>, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Array<Account>>;
  async loadAccounts(pubkeys: Array<HexString>, minimalState: AccountState, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    const accounts = this.readCache(pubkeys, opts);
    if (minimalState === 'calculated') {
      return accounts;
    }

    const accountsWithEssentialInfo = await this.patchAccountsToEssential(accounts);
    if (minimalState === 'essential') {
      return accountsWithEssentialInfo;
    }

    const accountsWithPointableInfo = await this.patchAccountsToOpenable(accountsWithEssentialInfo);
    if (minimalState === 'pointable') {
      return accountsWithPointableInfo;
    }
    
    const accountsWithCompleteInfo = await this.patchAccountsToComplete(accountsWithPointableInfo);
    if (minimalState === 'complete') {
      return accountsWithCompleteInfo;
    }

    return this.patchAccountsToComplete(accountsWithCompleteInfo);
  }

  readCache(pubkeys: Array<HexString>, opts?: NPoolRequestOptions): Array<Account> {
    return pubkeys.map(pubkey => {
      if (!opts || !opts.ignoreCache) {
        const account = this.profileCache.get(pubkey);
        if (account) {
          return account;
        }
      }

      return this.accountFactory.accountCalculatedFactory(pubkey);
    });
  }

  async patchAccountsToEssential(accounts: Array<Account>, opts?: NPoolRequestOptions): Promise<Array<AccountRenderable>> {
    const notLoadedPubkeys = accounts
      .filter(account => [ 'calculated', 'raw' ].includes(account.state))
      .map(account => account.pubkey);

    const events = await this.profileNostr.loadProfilesConfig(notLoadedPubkeys, opts);
    const relayRecord = this.relayConverter.convertEventsToRelayConfig(events);
    const metadataRecord = this.getProfileMetadata(events);

    const accountsRecord: { [pubkey: HexString]: AccountRenderable } = {};
    accounts.forEach(account => {
      if (account.state === 'raw') {
        account = this.accountFactory.accountCalculatedFactory(account);
      }

      if (account.state === 'calculated') {
        const metadata = metadataRecord[account.pubkey] || null;
        const relays = relayRecord[account.pubkey] || {};

        account = this.accountFactory.accountEssentialFactory(account, metadata, relays);
        accountsRecord[account.pubkey] = account;
      } else {
        accountsRecord[account.pubkey] = account;
      }
    });

    return Object.values(accountsRecord);
  }

  async patchAccountsToOpenable(accounts: Array<AccountRenderable>): Promise<Array<AccountOpenable>> {
    const pointableAccounts = new Array<AccountOpenable>();
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

  async patchAccountsToComplete(accounts: Array<AccountOpenable>): Promise<Array<AccountSession>> {
    const completeLoadedAccounts = new Array<AccountSession>();
    for await (const account of accounts) {
      if (account.state === 'pointable') {
        const pointable = await this.loadAccountComplete(account);
        completeLoadedAccounts.push(pointable);
      } else {
        completeLoadedAccounts.push(account);
      }
    }

    return completeLoadedAccounts;
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
