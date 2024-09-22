import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrEvent, kinds } from 'nostr-tools';
import { NSec } from '../domain/nsec.type';
import { UnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NostrConverter } from '../nostr/nostr.converter';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { AccountManagerService } from './account-manager.service';
import { NostrSigner } from './nostr.signer';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { RelayConverter } from '../nostr/relay.converter';
import { NostrGuard } from '../nostr/nostr.guard';
import { ConfigsLocalStorage } from '../configs/configs-local.storage';

// TODO: include load and cache of users relay list
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private guard: NostrGuard,
    private configs: ConfigsLocalStorage,
    private profileApi: ProfileNostr,
    private nostrSigner: NostrSigner,
    private profileCache: ProfileCache,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter,
    private accountManagerStatefull: AccountManagerService
  ) { }

  //  FIXME: must load from cache, except if opts include  ignoreCache=true
  async get(pubkey: string, opts?: NPoolRequestOptions): Promise<NostrMetadata | null> {
    const event = await this.profileApi.loadProfile(pubkey, opts);
    const [metadata] = await this.profileCache.add([event]);

    return Promise.resolve(metadata || null);
  }

  /**
   * load from pool or from the cache the metadata and relay configs,
   * if loaded from pool, it will be added to cache
   */
  async getFully(pubkey: string, opts?: NPoolRequestOptions): Promise<{ metadata: NostrMetadata | null, relays: NostrUserRelays }> {
    const events = await this.profileApi.loadProfileConfig(pubkey, opts);
    const record = this.relayConverter.convertEventsToRelayConfig(events);
    const result: {
      metadata: NostrMetadata | null,
      relays: NostrUserRelays
    } = {
      metadata: null,
      relays: record[pubkey]
    };

    const eventMetadata = events.filter((event): event is NostrEvent & { kind: 0 } => this.guard.isKind(event, kinds.Metadata));
    const [metadata] = await this.profileCache.add(eventMetadata);
    result.metadata = metadata || null;

    return Promise.resolve(result);
  }

  async list(pubkeys: string[], opts?: NPoolRequestOptions): Promise<Array<NostrMetadata>> {
    const events = await this.profileApi.loadProfiles(pubkeys, opts);
    return this.profileCache.add(events);
  }

  cache(profiles: Array<NostrEvent & { kind: 0 }>): Promise<Array<NostrMetadata>> {
    return this.profileCache.add(profiles);
  }

  //  FIXME: revisar este método para que ele retorne uma instância completa do unauthenticated account
  async loadAccountFromCredentials(nsec: NSec, password: string): Promise<UnauthenticatedAccount | null> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const ncrypted = this.nostrSigner.encryptNsec(password, nsec);

    const { metadata, relays } = await this.getFully(user.pubkey);
    const account = this.accountManagerStatefull.addAccount(user.pubkey, metadata, relays, ncrypted);

    return Promise.resolve(account);
  }

  async loadAccountRelayConfig(pubkey: string): Promise<NostrUserRelays> {
    const events = await this.profileApi.loadProfileConfig(pubkey);
    const config = this.relayConverter.convertEventsToRelayConfig(events);

    return Promise.resolve(config[pubkey]);
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

  removerUnauthenticatedAccount(pubkey: string): void {
    const local = this.configs.read();
    if (local.accounts) {
      delete local.accounts[pubkey];
    }

    this.configs.save(local);
  }
}
