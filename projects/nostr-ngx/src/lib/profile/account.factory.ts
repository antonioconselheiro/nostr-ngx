import { Inject, Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { getPublicKey } from 'nostr-tools';
import { decode, Ncryptsec, nprofileEncode, npubEncode, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { NostrConfig } from '../configs/nostr-config.interface';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountNip05Detail } from '../domain/account/account-nip05-detail.type';
import { AccountNotLoaded } from '../domain/account/account-not-loaded.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountViewable } from '../domain/account/account-viewable.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NOSTR_CONFIG_TOKEN } from '../injection-token/nostr-config.token';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { AccountResultset } from './account-resultset.type';

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
  accountEssentialFactory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays): AccountEssential {
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
  accountPointableFactory(account: AccountEssential, nip05ProfilePointer: ProfilePointer | null): AccountPointable {
    const nip05 = this.getPointerDetails(account.metadata, nip05ProfilePointer);

    //  more then 3 relays will make this problematic (TODO: include link with references for this decision)
    const nostrProfileRelays = nip05ProfilePointer?.relays?.length ?
      nip05ProfilePointer.relays : this.relayConverter.extractOutboxRelays(account.relays).splice(0, 3);
    const nprofile = nprofileEncode({
      pubkey: account.pubkey,
      relays: nostrProfileRelays
    });

    return { ...account, nprofile, nip05, state: 'pointable' };
  }

  accountViewableFactory(account: AccountPointable, profilePictureBase64: string | null): AccountViewable {
    return { ...account, picture: profilePictureBase64, state: 'viewable' };
  }
  
  accountCompleteFactory(account: AccountViewable, bannerBase64: string | null): AccountComplete {
    return { ...account, banner: bannerBase64, state: 'complete' };
  }

  accountAuthenticableFactory(account: AccountComplete, ncryptsec: Ncryptsec): AccountAuthenticable {
    return { ...account, ncryptsec, state: 'authenticable' };
  }

  accountFactoryFromNSec(nsec: NSec, ncryptsec: Ncryptsec, relays: NostrUserRelays, metadata: NostrMetadata | null): AccountAuthenticable {
    const { data } = decode(nsec);
    const pubkey = getPublicKey(data);
    const npub = npubEncode(pubkey);
    const pointerRelays = this.relayConverter.extractOutboxRelays(relays).splice(0, 2);
    const pointer: ProfilePointer = { pubkey, relays: pointerRelays };
    const nprofile = nprofileEncode(pointer);

    const account: AccountAuthenticable = {
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
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays): AccountEssential;
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec: Ncryptsec): AccountAuthenticable;
  // eslint-disable-next-line complexity
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec?: Ncryptsec): AccountEssential | AccountAuthenticable {
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

    let account: AccountAuthenticable | AccountComplete = {
      displayName,
      state: 'complete',
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

  private getPointerDetails(metadata: NostrMetadata | null, nip05: ProfilePointer | null): AccountNip05Detail {
    let relays: string[] = [],
      address: string | null = null,
      pointer = null;

    if (metadata?.nip05) {
      address = metadata.nip05;
      if (nip05) {
        relays = nip05.relays || [];
        pointer = nip05;
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
