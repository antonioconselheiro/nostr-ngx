import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { Ncryptsec, nprofileEncode, npubEncode, ProfilePointer } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountNip05Detail } from '../domain/account/account-nip05-detail.type';
import { AccountNotLoaded } from '../domain/account/account-not-loaded.interface';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountViewable } from '../domain/account/account-viewable.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { Account } from '../domain/account/account.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountFactory {

  constructor(
    private relayConverter: RelayConverter
  ) { }

  /**
   * create account object just with pubkey
   *
   * @param pubkey user hex
   *
   * @returns AccountNot, Account
   */
  factory(pubkey: HexString): AccountNotLoaded;

  /**
   * create account object
   * pubkey + relays config + metadata
   *
   * @param pubkey user hex
   * @param relays NostrUserRelays parsed from user relay lists events
   * @param metadata NostrMetadata parsed from metadata event
   *
   * @returns AccountEssential, Account
   */
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays): AccountEssential;

  /**
   * create account object
   * pubkey + relays config + metadata + nip05
   *
   * @param pubkey user hex
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   * 
   * @return AccountPointable, Account
   */
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null): AccountPointable;

  /**
   * create account object
   * pubkey + relays config + metadata + nip05 + base64 picture
   *
   * @param pubkey user hex
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   * @param profilePictureBase64 base64 string, loaded using method linkToBase64 from FileManager service
   * 
   * @return AccountViewable, Account
   */
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null, profilePictureBase64: string | null): AccountViewable;

  /**
   * create account object
   * pubkey + relays config + metadata + nip05 + base64 picture + base64 banner
   *
   * @param pubkey user hex
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   * @param profilePictureBase64 base64 string, picture loaded using method linkToBase64 from FileManager service
   * @param bannerBase64 base64 string, banner loaded using method linkToBase64 from FileManager service
   * 
   * @return AccountComplete, Account
   */
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null, profilePictureBase64: string | null, bannerBase64: string | null): AccountComplete;

  /**
   * create account object
   * pubkey + relays config + metadata + nip05 + base64 picture + base64 banner + ncryptsec
   *
   * @param pubkey user hex
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   * @param profilePictureBase64 base64 string, picture loaded using method linkToBase64 from FileManager service
   * @param bannerBase64 base64 string, banner loaded using method linkToBase64 from FileManager service
   * @param ncryptsec cipher from nsec encrypted as ncryptsec
   * 
   * @return AccountAuthenticable, Account
   */
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null, profilePictureBase64: string | null, bannerBase64: string | null, ncryptsec: Ncryptsec): AccountAuthenticable;

  /**
   * create account object
   *
   * @param pubkey user hex
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   * @param profilePictureBase64 base64 string, picture loaded using method linkToBase64 from FileManager service
   * @param bannerBase64 base64 string, banner loaded using method linkToBase64 from FileManager service
   * @param ncryptsec cipher from nsec encrypted as ncryptsec
   * 
   * @return Account
   */
  factory(pubkey: HexString, metadata?: NostrMetadata | null, relays?: NostrUserRelays, nip05ProfilePointer?: ProfilePointer | null, profilePictureBase64?: string | null, bannerBase64?: string | null, ncryptsec?: Ncryptsec): Account;
  factory(pubkey: HexString, metadata?: NostrMetadata | null, relays?: NostrUserRelays, nip05ProfilePointer?: ProfilePointer | null, profilePictureBase64?: string | null, bannerBase64?: string | null, ncryptsec?: Ncryptsec): Account {
    const notLoaded = this.accountNotLoadedFactory(pubkey);
    if (metadata && relays) {
      const essential = this.accountEssentialFactory(notLoaded, metadata, relays);

      if (nip05ProfilePointer) {
        const pointable = this.accountPointableFactory(essential, nip05ProfilePointer);

        if (profilePictureBase64) {
          const viewable = this.accountViewableFactory(pointable, profilePictureBase64);
          if (bannerBase64) {
            const complete = this.accountCompleteFactory(viewable, bannerBase64);

            if (ncryptsec) {
              return this.accountAuthenticableFactory(complete, ncryptsec);
            }

            return complete;
          }

          return viewable;
        }

        return pointable;
      }

      return essential;
    }

    return notLoaded;
  }

  /**
   * create account object just with pubkey
   *
   * @param pubkey user hex
   *
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
   * derivate essential account from not loaded account
   * account not loaded + metadata + relays config
   * 
   * @param account AccountNotLoaded
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   *
   * @returns AccountEssential, Account
   */
  accountEssentialFactory(account: AccountNotLoaded, metadata: NostrMetadata | null, relays: NostrUserRelays): AccountEssential {
    //  more then 3 relays will make this problematic (TODO: include link with references for this decision)
    const nostrProfileRelays = this.relayConverter.extractOutboxRelays(relays).splice(0, 3);
    const nprofile = nprofileEncode({ pubkey: account.pubkey, relays: nostrProfileRelays });
    const displayName = metadata?.display_name || metadata?.name || '';

    return {
      ...account,
      displayName,
      state: 'essential',
      nprofile,
      metadata,
      relays
    };
  }

  /**
   * derivate pointable account from essential account
   * essential account + nip05 profile pointer
   * 
   * @param account AccountEssential
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   *
   * @returns AccountPointable, Account
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

  /**
   * derivate viewable account from pointable account
   * account pointable + base64 picture
   *
   * @param account AccountPointable
   * @param profilePictureBase64 base64 string, loaded using method linkToBase64 from FileManager service
   *
   * @returns AccountViewable, Account
   */
  accountViewableFactory(account: AccountPointable, profilePictureBase64: string | null): AccountViewable {
    return { ...account, picture: profilePictureBase64, state: 'viewable' };
  }

  /**
   * derivate complete account from viewable account
   * account viewable + base64 banner
   *
   * @param account AccountViewable
   * @param bannerBase64 base64 string, banner loaded using method linkToBase64 from FileManager service
   *
   * @returns AccountComplete, Account
   */
  accountCompleteFactory(account: AccountViewable, bannerBase64: string | null): AccountComplete {
    return { ...account, banner: bannerBase64, state: 'complete' };
  }

  /**
   * derivate authenticable account from complete account
   * account complete + ncryptsec
   *
   * @param account AccountComplete
   * @param ncryptsec cipher from nsec encrypted as ncryptsec
   *
   * @returns AccountComplete, Account
   */
  accountAuthenticableFactory(account: AccountComplete, ncryptsec: Ncryptsec): AccountAuthenticable {
    return { ...account, ncryptsec, state: 'authenticable' };
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
