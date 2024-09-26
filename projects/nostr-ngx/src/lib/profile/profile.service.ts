import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrEvent, kinds, nip19 } from 'nostr-tools';
import { ProfilePointer } from 'nostr-tools/nip19';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Account } from '../domain/account.interface';
import { NProfile } from '../domain/nprofile.type';
import { NPub } from '../domain/npub.type';
import { NSec } from '../domain/nsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NostrConverter } from '../nostr/nostr.converter';
import { NostrGuard } from '../nostr/nostr.guard';
import { RelayConverter } from '../nostr/relay.converter';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { AccountManagerService } from './account-manager.service';
import { NostrSigner } from './nostr.signer';
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
export class ProfileService {

  constructor(
    private guard: NostrGuard,
    private configs: ConfigsLocalStorage,
    private profileNostr: ProfileNostr,
    private nostrSigner: NostrSigner,
    private profileCache: ProfileCache,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter,
    private accountManager: AccountManagerService
  ) { }

  /**
   * load from pool or from the cache the metadata and relay configs,
   * if loaded from pool, it will be added to cache
   */
  async getAccount(pubkey: string, opts?: NPoolRequestOptions): Promise<Account> {
    const events = await this.profileNostr.loadProfileConfig(pubkey, opts);
    const record = this.relayConverter.convertEventsToRelayConfig(events);

    const eventMetadata = events.filter((event): event is NostrEvent & { kind: 0 } => this.guard.isKind(event, kinds.Metadata));
    const [[metadata]] = await this.profileCache.add(eventMetadata);
    const pointerRelays = this.relayConverter.extractOutboxRelays(record[pubkey]).splice(0, 2);
    const account = this.accountManager.accountFactory(pubkey, metadata || null, pointerRelays, record[pubkey]);

    return Promise.resolve(account);
  }

  async listAccounts(pubkeys: Array<string>, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    const events = await this.profileNostr.loadProfilesConfig(pubkeys, opts);
    const record: {
      [pubkey: string]: NostrUserRelays & { metadata?: NostrMetadata }
    } = this.relayConverter.convertEventsToRelayConfig(events);
    const eventMetadataList = events
      .filter((event): event is NostrEvent & { kind: 0 } => this.guard.isKind(event, kinds.Metadata));
    const tupleList = await this.profileCache.add(eventMetadataList);
    tupleList.forEach(([metadata, eventMetadata]) => {
      if (record[eventMetadata.pubkey]) {
        record[eventMetadata.pubkey].metadata = metadata;
      }
    });

    return pubkeys.map(pubkey => {
      const relays = record[pubkey];
      const metadata = record[pubkey] && record[pubkey].metadata || null;
      const pointerRelays = this.relayConverter.extractOutboxRelays(relays).splice(0, 2);

      return this.accountManager.accountFactory(
        pubkey, metadata, pointerRelays, relays
      );
    });
  }

  getAccountUsingNPub(npub: NPub, opts?: NPoolRequestOptions): Promise<Account> {
    const { data } = nip19.decode(npub);
    return this.getAccount(data, opts);
  }

  listAccountsUsingNPub(npubs: Array<NPub>, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    return this.listAccounts(npubs.map(npub => {
      const { data } = nip19.decode(npub);
      return data;
    }), opts);
  }
  
  getAccountUsingNProfile(nprofile: NProfile, opts?: NPoolRequestOptions): Promise<Account> {
    const { data } = nip19.decode(nprofile);
    opts = opts || {};
    opts.include = opts.include ? [ ...opts.include, data ] : [ data ];
    return this.getAccount(data.pubkey, opts);
  }

  listAccountsUsingNProfile(nprofiles: Array<NProfile>, opts?: NPoolRequestOptions): Promise<Array<Account>> {
    const include: ProfilePointer[] = [];
    const pubkeys = nprofiles.map(nprofile => {
      const { data } = nip19.decode(nprofile);
      include.push(data);
      return data.pubkey;
    })
    opts = opts || {};
    opts.include = opts.include ? [ ...opts.include, ...include ] : include;
    return this.listAccounts(pubkeys, opts);
  }

  // TODO:
  //listenUpdates(pubkeys: Array<string>, opts?: NPoolRequestOptions): Observable<Account> {
  //}

  /**
   * use this when you receive a kind 0 event that does not come from this service
   */
  cache(profiles: Array<NostrEvent & { kind: 0 }>): Promise<Array<[NostrMetadata, NostrEvent & { kind: 0 }]>> {
    return this.profileCache.add(profiles);
  }

  //  FIXME: revisar este método para que ele retorne uma instância completa do unauthenticated account
  async loadAccountFromCredentials(nsec: NSec, password: string): Promise<UnauthenticatedAccount> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const ncryptsec = this.nostrSigner.encryptNsec(password, nsec);
    const account = await this.getAccount(user.pubkey);

    return Promise.resolve({ ...account, ncryptsec });
  }

  /**
   * Include account to login later
   */
  addUnauthenticatedAccount(account: UnauthenticatedAccount): void {
    const local = this.configs.read();
    if (!local.accounts) {
      local.accounts = {};
    }

    local.accounts[account.pubkey] = account;
    this.configs.save(local);
  }

  removeUnauthenticatedAccount(pubkey: string): void {
    const local = this.configs.read();
    if (local.accounts) {
      delete local.accounts[pubkey];
    }

    this.configs.save(local);
  }
}
