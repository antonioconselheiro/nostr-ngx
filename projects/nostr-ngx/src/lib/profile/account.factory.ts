import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { decode, Ncryptsec, nprofileEncode, NPub, npubEncode, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountCalculated } from '../domain/account/account-calculated.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountNip05Detail } from '../domain/account/account-nip05-detail.type';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { AccountOpenable } from '../domain/account/compose/account-openable.type';
import { AccountSession } from '../domain/account/compose/account-session.type';
import { Account } from '../domain/account/compose/account.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrConverter } from '../nostr-utils/nostr.converter';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { RelayConverter } from '../nostr-utils/relay.converter';

@Injectable({
  providedIn: 'root'
})
export class AccountFactory {

  constructor(
    private nostrGuard: NostrGuard,
    private nostrConverter: NostrConverter,
    private relayConverter: RelayConverter
  ) { }

  /**
   * create account object just with pubkey
   *
   * @param pubkey user hex
   *
   * @returns AccountNot, Account
   */
  factory(pubkey: HexString): AccountCalculated;

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
   * @return AccountComplete, Account
   */
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null, profilePictureBase64: string | null): AccountComplete;

  /**
   * create account object
   * pubkey + relays config + metadata + nip05 + base64 picture + base64 banner + ncryptsec
   *
   * @param pubkey user hex
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   * @param profilePictureBase64 base64 string, picture loaded using method linkToBase64 from FileManager service
   * @param ncryptsec cipher from nsec encrypted as ncryptsec
   * 
   * @return AccountAuthenticable, Account
   */
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null, profilePictureBase64: string | null, ncryptsec: Ncryptsec): AccountAuthenticable;

  /**
   * create account object
   *
   * @param pubkey user hex
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   * @param nip05ProfilePointer ProfilePointer loaded from nip05 query
   * @param profilePictureBase64 base64 string, picture loaded using method linkToBase64 from FileManager service
   * @param ncryptsec cipher from nsec encrypted as ncryptsec
   * 
   * @return Account
   */
  factory(
    pubkey: HexString,
    metadata?: NostrMetadata | null,
    relays?: NostrUserRelays,
    nip05ProfilePointer?: ProfilePointer | null,
    profilePictureBase64?: string | null,
    ncryptsec?: Ncryptsec
  ): Account;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null,
    profilePictureBase64: string | null,
    ncryptsec: Ncryptsec
  ): AccountAuthenticable;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null,
    profilePictureBase64: string | null,
    ncryptsec?: Ncryptsec
  ): AccountSession;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null,
    profilePictureBase64: string | null
  ): AccountComplete;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null
  ): AccountPointable;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null,
    profilePictureBase64?: string | null,
    ncryptsec?: Ncryptsec
  ): AccountOpenable;
  factory(
    pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays
  ): AccountEssential;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer?: ProfilePointer | null,
    profilePictureBase64?: string | null,
    ncryptsec?: Ncryptsec
  ): AccountRenderable;
  factory(pubkey: HexString): AccountCalculated;
  factory(
    pubkey: HexString,
    metadata?: NostrMetadata | null,
    relays?: NostrUserRelays,
    nip05ProfilePointer?: ProfilePointer | null,
    profilePictureBase64?: string | null,
    ncryptsec?: Ncryptsec
  ): Account {
    const calculated = this.accountCalculatedFactory(pubkey);
    if (metadata && relays) {
      const essential = this.accountEssentialFactory(calculated, metadata, relays);

      if (nip05ProfilePointer) {
        const pointable = this.accountPointableFactory(essential, nip05ProfilePointer);

        if (profilePictureBase64) {
          const complete = this.accountCompleteFactory(pointable, profilePictureBase64);
          if (ncryptsec) {
            return this.accountAuthenticableFactory(complete, ncryptsec);
          }

          return complete;
        }

        return pointable;
      }

      return essential;
    }

    return calculated;
  }

  /**
   * create account object just with pubkey
   *
   * @param pubkey user hex
   *
   * @returns AccountCalculated, Account
   */
  accountCalculatedFactory(pubkey: HexString): AccountCalculated;
  accountCalculatedFactory(npub: NPub): AccountCalculated;
  accountCalculatedFactory(nsec: NSec): AccountCalculated;
  accountCalculatedFactory(arg: string): AccountCalculated {
    if (this.nostrGuard.isHexadecimal(arg)) {
      const npub = npubEncode(arg);

      return {
        npub,
        pubkey: arg,
        state: 'calculated',
        nip05: null,
        picture: null
      };
    } else if (this.nostrGuard.isNPub(arg)) {
      const pubkey = String(decode(arg));

      return {
        npub: arg,
        pubkey,
        state: 'calculated',
        nip05: null,
        picture: null
      };
    } else if (this.nostrGuard.isNSec(arg)) {
      const publics = this.nostrConverter.convertNSecToPublicKeys(arg);

      return {
        npub: publics.npub,
        pubkey: publics.pubkey,
        state: 'calculated',
        nip05: null,
        picture: null
      };
    } else {
      throw new Error('invalid string format given as argument to AccountFactory#accountCalculatedFactory');
    }
  }

  /**
   * derivate essential account from calculated account
   * account calculated + metadata + relays config
   * 
   * @param account AccountCalculated
   * @param metadata NostrUserRelays parsed from user relay lists events
   * @param relays NostrMetadata parsed from metadata event
   *
   * @returns AccountEssential, Account
   */
  accountEssentialFactory(account: AccountCalculated, metadata: NostrMetadata | null, relays: NostrUserRelays): AccountEssential {
    //  more then 3 relays will make this problematic (TODO: include link with references for this decision)
    const nostrProfileRelays = this.relayConverter.extractOutboxRelays(relays).splice(0, 3);
    const nprofile = nprofileEncode({ pubkey: account.pubkey, relays: nostrProfileRelays });
    const displayName = metadata?.display_name || metadata?.name || '';
    const picture = metadata?.picture || null;

    return {
      ...account,
      displayName,
      state: 'essential',
      nprofile,
      metadata,
      picture,
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
    const picture = account.metadata?.picture || null;

    return { ...account, nprofile, nip05, picture, state: 'pointable' };
  }

  /**
   * derivate complete loaded account from pointable account
   * account pointable + base64 picture
   *
   * @param account AccountPointable
   * @param profilePictureBase64 base64 string, loaded using method linkToBase64 from FileManager service
   *
   * @returns AccountComplete, Account
   */
  accountCompleteFactory(account: AccountPointable, profilePictureBase64: string | null): AccountComplete {
    return { ...account, picture: profilePictureBase64, state: 'complete' };
  }

  /**
   * derivate authenticable account from complete loaded account
   * account complete loaded + ncryptsec
   *
   * @param account AccountComplete
   * @param ncryptsec cipher from nsec encrypted as ncryptsec
   *
   * @returns AccountComplete, Account
   */
  accountAuthenticableFactory(account: AccountComplete, ncryptsec: Ncryptsec): AccountAuthenticable;
  accountAuthenticableFactory(account: AccountSession, ncryptsec: Ncryptsec): AccountAuthenticable;
  accountAuthenticableFactory(account: AccountComplete, ncryptsec: Ncryptsec): AccountAuthenticable {
    return { ...account, ncryptsec, state: 'authenticable' };
  }

  //  TODO: não inclui meios do nip05 ser incluso logo na primeira criação de conta, preciso pensar em como incluir ele como configuração inicial nas telas de passo a passo para criação de conta 
  createAccount(nsec: NSec, ncryptsec: Ncryptsec, metadata: NostrMetadata | null, relays: NostrUserRelays, profilePictureBase64?: string | null): AccountAuthenticable {
    const publics = this.nostrConverter.convertNSecToPublicKeys(nsec);
    const essential = this.accountEssentialFactory({ ...publics, state: 'calculated', nip05: null, picture: null }, metadata, relays);

    return {
      ...essential,
      state: 'authenticable',
      nip05: null,
      ncryptsec,
      metadata,
      picture: profilePictureBase64 || null,
      relays
    };
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
