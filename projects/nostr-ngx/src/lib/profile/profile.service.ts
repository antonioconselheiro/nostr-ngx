import { Injectable } from '@angular/core';
import { kinds, nip19 } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { NProfile, NPub, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { AccountsLocalStorage } from '../configs/accounts-local.storage';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Account } from '../domain/account/account.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { UnauthenticatedAccount } from '../domain/account/unauthenticated-account.interface';
import { NostrConverter } from '../nostr-utils/nostr.converter';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { NSecCrypto } from '../nostr-utils/nsec.crypto';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { AccountResultset } from './account-resultset.type';
import { AccountFactory } from './account.factory';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';

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
export class ProfileService {

  constructor(
    private guard: NostrGuard,
    private nsecCrypto: NSecCrypto,
    private profileCache: ProfileCache,
    private profileNostr: ProfileNostr,
    private relayConverter: RelayConverter,
    private nostrConverter: NostrConverter,
    private localConfigs: AccountsLocalStorage,
    private accountFactory: AccountFactory
  ) { }

  /**
   * load from pool or from the cache the metadata and relay configs,
   * if loaded from pool, it will be added to cache
   */
  async loadAccount(pubkey: HexString, opts?: NPoolRequestOptions): Promise<AccountEssential> {
    const events = await this.profileNostr.loadProfileConfig(pubkey, opts);
    const record = this.relayConverter.convertEventsToRelayConfig(events);

    const eventMetadata = events.filter((event): event is NostrEvent<Metadata> => this.guard.isKind(event, kinds.Metadata));
    const [resultset = null] = await this.profileCache.add(eventMetadata);
    const account = this.accountFactory.accountFactory(pubkey, resultset, record[pubkey] || {});

    return Promise.resolve(account);
  }

  async loadAccountComplete(pubkey: HexString, opts?: NPoolRequestOptions): Promise<AccountComplete> {

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

  async loadAccountFromCredentials(nsec: NSec, password: string): Promise<UnauthenticatedAccount> {
    const user = this.nostrConverter.convertNsecToPublicKeys(nsec);
    const ncryptsec = this.nsecCrypto.encryptNSec(nsec, password);
    const account = await this.loadAccount(user.pubkey);

    return Promise.resolve({ ...account, ncryptsec, state: 'authenticable' });
  }

  /**
   * Include account to login later
   */
  addUnauthenticatedAccount(account: UnauthenticatedAccount): void {
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
