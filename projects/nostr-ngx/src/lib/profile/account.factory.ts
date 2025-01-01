import { Inject, Injectable } from '@angular/core';
import { NSchema as n, NostrMetadata } from '@nostrify/nostrify';
import { getPublicKey } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { decode, Ncryptsec, nprofileEncode, npubEncode, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { NostrConfig } from '../configs/nostr-config.interface';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountDeepLoaded } from '../domain/account/account-deep-loaded.interface';
import { AccountEssentialLoaded } from '../domain/account/account-essential-loaded.interface';
import { AccountFullLoaded } from '../domain/account/account-full-loaded.interface';
import { AccountNip05 } from '../domain/account/account-nip05.interface';
import { AccountNotLoaded } from '../domain/account/account-not-loaded.interface';
import { AccountViewingLoaded } from '../domain/account/account-viewing-loaded.interface';
import { UnauthenticatedAccount } from '../domain/account/unauthenticated-account.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { AccountResultset } from './account-resultset.type';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { queryProfile } from 'nostr-tools/nip05';

@Injectable({
  providedIn: 'root'
})
export class AccountFactory {

  constructor(
    private relayConverter: RelayConverter,
    @Inject(NOSTR_CONFIG_TOKEN) private nostrConfig: Required<NostrConfig>
  ) { }

  /**
   * create account object just with pubkey
   * @param pubkey user hex
   * @returns AccountNotLoaded, Account
   */
  accountNotLoadedFactory(pubkey: HexString): AccountNotLoaded {
    const npub = npubEncode(pubkey);
    return {
      npub,
      pubkey,
      state: 'notloaded'
    };
  }

  /**
   * create account object using resources parsed from account config events like relay list and user metadata
   * pubkey + relays config + metadata
   *
   * @param pubkey user hex
   * @param relays NostrUserRelays parsed from user relay lists events
   * @param metadata NostrMetadata parsed from metadata event
   * @returns AccountEssentialLoaded, Account
   */
  accountEssentialFactory(pubkey: HexString, relays: NostrUserRelays, metadata: NostrMetadata | null): AccountEssentialLoaded {
    //  more then 3 relays will make this problematic (TODO: include link with references for this decision)
    const nostrProfileRelays = this.relayConverter.extractOutboxRelays(relays).splice(0, 3);
    const nprofile = nprofileEncode({ pubkey, relays: nostrProfileRelays });

    const npub = npubEncode(pubkey);
    const displayName = metadata?.display_name || metadata?.name || '';

    return {
      displayName,
      state: 'essential',
      nprofile,
      metadata,
      relays,
      pubkey,
      npub
    };
  }

  /**
   * create account object using resultset parsed from account config events like relay list and user metadata
   *
   * @param pubkey 
   * @param resultset 
   * @param relays 
   * @returns AccountFullLoaded, Account
   */
  accountFullFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays): AccountFullLoaded {
    const metadata = resultset?.metadata || null;

    const npub = npubEncode(pubkey);
    const displayName = metadata?.display_name || metadata?.name || '';
    const nip05 = this.getPointerDetails(resultset);

    //  more then 3 relays will make this problematic (TODO: include link with references for this decision)
    const nostrProfileRelays = nip05.relays.length ? nip05.relays : this.relayConverter.extractOutboxRelays(relays).splice(0, 3);
    const nprofile = nprofileEncode({ pubkey, relays: nostrProfileRelays });

    return {
      displayName,
      state: 'full',
      nprofile,
      metadata,
      relays,
      nip05,
      pubkey,
      npub
    };
  }
  
  // eslint-disable-next-line complexity
  accountViewingFactory(): AccountViewingLoaded {
    let picture = this.nostrConfig.defaultProfile.picture,
      banner = this.nostrConfig.defaultProfile.banner;
    const metadata = resultset?.metadata || null;

    if (metadata?.picture) {
      picture = metadata.picture;
    }

    if (metadata?.banner) {
      banner = metadata.banner;
    }

    const npub = npubEncode(pubkey);
    const displayName = metadata?.display_name || metadata?.name || '';
    const nip05 = this.getPointerDetails(resultset);

    //  more then 3 relays will make this problematic (TODO: include link with references for this decision)
    const nostrProfileRelays = nip05.relays.length ? nip05.relays : this.relayConverter.extractOutboxRelays(relays).splice(0, 3);
    const nprofile = nprofileEncode({ pubkey, relays: nostrProfileRelays });

    return {
      displayName,
      state: 'viewing',
      nprofile,
      metadata,
      picture,
      banner,
      relays,
      nip05,
      pubkey,
      npub
    };
  }
  
  accountDeepFactory(): AccountDeepLoaded {

  }

  accountUnauthenticatedFactory(): UnauthenticatedAccount {

  }

  accountFactoryFromNSec(nsec: NSec, ncryptsec: Ncryptsec, relays: NostrUserRelays, metadata: NostrMetadata | null): UnauthenticatedAccount {
    const { data } = decode(nsec);
    const pubkey = getPublicKey(data);
    const npub = npubEncode(pubkey);
    const pointerRelays = this.relayConverter.extractOutboxRelays(relays).splice(0, 2);
    const pointer: ProfilePointer = { pubkey, relays: pointerRelays };
    const nprofile = nprofileEncode(pointer);

    const account: UnauthenticatedAccount = {
      metadata,
      ncryptsec,
      pubkey,
      npub,
      nprofile,
      state: 'authenticable',
      displayName: metadata?.display_name || metadata?.name || '',
      picture: this.nostrConfig.defaultProfile.picture,
      banner: this.nostrConfig.defaultProfile.banner,
      //  TODO: Nip05 precisa ser validado aqui e sua validação precisa ficar em cache
      nip05: null,
      relays
    }

    return account;
  }

  /**
   * Create an account with user prefetched content
   */
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays): AccountEssentialLoaded;
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec: Ncryptsec): UnauthenticatedAccount;
  // eslint-disable-next-line complexity
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec?: Ncryptsec): AccountEssentialLoaded | UnauthenticatedAccount {
    let picture = this.nostrConfig.defaultProfile.picture,
      banner = this.nostrConfig.defaultProfile.banner;
    const metadata = resultset?.metadata || null;

    if (metadata?.picture) {
      picture = metadata.picture;
    }

    if (metadata?.banner) {
      banner = metadata.banner;
    }

    const npub = npubEncode(pubkey);
    const displayName = metadata?.display_name || metadata?.name || '';
    const nip05 = this.getPointerDetails(resultset);

    //  more then 3 relays will make this problematic (TODO: include link with references for this decision)
    const nostrProfileRelays = nip05.relays.length ? nip05.relays : this.relayConverter.extractOutboxRelays(relays).splice(0, 3);
    const nprofile = nprofileEncode({ pubkey, relays: nostrProfileRelays });

    let account: UnauthenticatedAccount | AccountDeepLoaded = {
      displayName,
      state: 'deep',
      nprofile,
      metadata,
      picture,
      banner,
      relays,
      nip05,
      pubkey,
      npub
    };

    if (ncryptsec) {
      account = { ...account, ncryptsec, state: 'authenticable' };
    }

    return account;
  }

  private async accountResultsetFactory(event: NostrEvent<Metadata>): Promise<AccountResultset> {
    const metadata = n
      .json()
      .pipe(n.metadata())
      .parse(event.content);

    const resultset: AccountResultset = {
      pubkey: event.pubkey, event, metadata, nip05: null
    };

    try {
      if (metadata.nip05 && metadata.nip05.trim()) {
        const nip05Pointer = await queryProfile(metadata.nip05);
        resultset.nip05 = nip05Pointer || null;
      }
    } catch { }

    return resultset;
  }

  private getPointerDetails(resultset: AccountResultset | null): AccountNip05 {
    const metadata: NostrMetadata | null = resultset?.metadata || null;
    let relays: string[] = [],
      address: string | null = null,
      pointer = null;

    if (metadata?.nip05) {
      address = metadata.nip05;
      if (resultset?.nip05) {
        relays = resultset.nip05.relays || [];
        pointer = resultset.nip05;
      }
    }

    if (address && pointer && relays.length) {
      return {
        address,
        pointer,
        relays,
        valid: true
      }
    }

    return {
      address,
      pointer,
      relays,
      valid: false
    }
  }
}
