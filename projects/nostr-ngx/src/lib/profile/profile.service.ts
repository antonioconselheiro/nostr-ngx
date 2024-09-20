import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { NostrEvent, kinds } from 'nostr-tools';
import { NSec } from '../domain/nsec.type';
import { IUnauthenticatedAccount } from '../domain/unauthenticated-account.interface';
import { NostrConverter } from '../nostr/nostr.converter';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { AccountManagerStatefull } from './account-manager.statefull';
import { NostrSigner } from './nostr.signer';
import { ProfileCache } from './profile.cache';
import { ProfileNostr } from './profile.nostr';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { RelayConverter } from '../nostr/relay.converter';
import { NostrGuard } from '../nostr/nostr.guard';

// TODO: include load and cache of users relay list
@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private nostrSigner: NostrSigner,
    private profileApi: ProfileNostr,
    private accountManagerStatefull: AccountManagerStatefull,
    private profileCache: ProfileCache,
    private nostrConverter: NostrConverter,
    private guard: NostrGuard,
    private relayConverter: RelayConverter
  ) { }

  //  FIXME: must load from cache, except if opts include  ignoreCache=true
  async get(pubkey: string, opts?: NPoolRequestOptions): Promise<NostrMetadata | null> {
    const event = await this.profileApi.loadProfile(pubkey, opts);
    const [ metadata ] = await this.profileCache.add([event]);

    return Promise.resolve(metadata || null);
  }

  /**
   * load from pool or from the cache the metadata and relay configs
   */
  async getFully(pubkey: string, opts?: NPoolRequestOptions): Promise<{ metadata: NostrMetadata | null, relays: NostrUserRelays }> {
    const events = await this.profileApi.loadFullyProfileConfig(pubkey, opts);
    const record = this.relayConverter.convertEventsToRelayConfig(events);
    const result: {
      metadata: NostrMetadata | null,
      relays: NostrUserRelays
    } = {
      relays: record[pubkey],
      metadata: null
    };

    const eventMetadata = events.filter(event => this.guard.isKind(event, kinds.Metadata));
    const [ metadata ] = await this.profileCache.add(eventMetadata);
    result.metadata = metadata;

    return Promise.resolve(result);
  }

  async list(pubkeys: string[], opts?: NPoolRequestOptions): Promise<Array<NostrMetadata>> {
    const events = await this.profileApi.loadProfiles(pubkeys, opts);
    return this.profileCache.add(events);
  }

  add(profiles: Array<NostrEvent & { kind: 0 }>): void {
    this.profileCache.add(profiles);
  }

  //  FIXME: revisar este método para que ele retorne uma instância completa do unauthenticated account
  async loadAccountFromCredentials(nsec: NSec, password: string): Promise<IUnauthenticatedAccount | null> {
    const user = this.nostrConverter.convertNsecToNpub(nsec);
    const profile = await this.get(user.pubkey);
    const ncrypted = this.nostrSigner.encryptNsec(password, nsec);
    const relays = await this.profileApi.loadProfileRelayConfig(user.pubkey);
    const account = this.accountManagerStatefull.addAccount(user.npub, profile, ncrypted, relays);

    return Promise.resolve(account);
  }

  async loadAccountRelayConfig(pubkey: string): Promise<NostrUserRelays> {
    const events = await this.profileApi.loadProfileRelayConfig(pubkey);
    const config = this.relayConverter.convertEventsToRelayConfig(events);

    return Promise.resolve(config[pubkey]);
  }
}
