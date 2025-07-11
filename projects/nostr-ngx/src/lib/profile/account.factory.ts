import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { isNip05, Nip05 } from 'nostr-tools/nip05';
import { decode, Ncryptsec, nprofileEncode, NPub, npubEncode, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountAuthenticable } from '../domain/account/account-authenticable.interface';
import { AccountCalculated } from '../domain/account/account-calculated.interface';
import { AccountComplete } from '../domain/account/account-complete.interface';
import { AccountEssential } from '../domain/account/account-essential.interface';
import { AccountNip05Detail } from '../domain/account/account-nip05-detail.type';
import { AccountPointable } from '../domain/account/account-pointable.interface';
import { AccountOpenable } from '../domain/account/compose/account-openable.type';
import { AccountRenderable } from '../domain/account/compose/account-renderable.type';
import { AccountSession } from '../domain/account/compose/account-session.type';
import { Account } from '../domain/account/compose/account.interface';
import { Base64String } from '../domain/base64-string.type';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrConverter } from '../nostr-utils/nostr.converter';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { RelayConverter } from '../nostr-utils/relay.converter';
import { AccountRaw } from '../domain/account/account-raw.interface';
import { AccountGuard } from './account.guard';

@Injectable({
  providedIn: 'root'
})
export class AccountFactory {

  constructor(
    private nostrGuard: NostrGuard,
    private accountGuard: AccountGuard,
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
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null, profilePictureBase64: Base64String | null): AccountComplete;

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
  factory(pubkey: HexString, metadata: NostrMetadata | null, relays: NostrUserRelays, nip05ProfilePointer: ProfilePointer | null, profilePictureBase64: Base64String | null, ncryptsec: Ncryptsec): AccountAuthenticable;

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
    profilePictureBase64?: Base64String | null,
    ncryptsec?: Ncryptsec
  ): Account;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null,
    profilePictureBase64: Base64String | null,
    ncryptsec: Ncryptsec
  ): AccountAuthenticable;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null,
    profilePictureBase64: Base64String | null,
    ncryptsec?: Ncryptsec
  ): AccountSession;
  factory(
    pubkey: HexString,
    metadata: NostrMetadata | null,
    relays: NostrUserRelays,
    nip05ProfilePointer: ProfilePointer | null,
    profilePictureBase64: Base64String | null
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
    profilePictureBase64?: Base64String | null,
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
    profilePictureBase64?: Base64String | null,
    ncryptsec?: Ncryptsec
  ): AccountRenderable;
  factory(pubkey: HexString): AccountCalculated;
  factory(
    pubkey: HexString,
    metadata?: NostrMetadata | null,
    relays?: NostrUserRelays,
    nip05ProfilePointer?: ProfilePointer | null,
    profilePictureBase64?: Base64String | null,
    ncryptsec?: Ncryptsec
  ): Account {
    const calculated = this.accountCalculatedFactory(pubkey);
    if (relays) {
      const essential = this.accountEssentialFactory(calculated, metadata || null, relays);

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
  accountCalculatedFactory(nsec: AccountRaw): AccountCalculated;
  accountCalculatedFactory(arg: string | AccountRaw): AccountCalculated {
    if (this.accountGuard.isRaw(arg)) {
      const npub = npubEncode(arg.pubkey);
      const displayName = this.generateDisplayNameFromNPub(npub);

      return {
        npub,
        pubkey: arg.pubkey,
        state: 'calculated',
        displayName,
        nip05: null,
        pictureBase64: null,
        pictureUrl: null
      };
    } else if (this.nostrGuard.isHexadecimal(arg)) {
      const npub = npubEncode(arg);
      const displayName = this.generateDisplayNameFromNPub(npub);

      return {
        npub,
        pubkey: arg,
        state: 'calculated',
        displayName,
        nip05: null,
        pictureBase64: null,
        pictureUrl: null
      };
    } else if (this.nostrGuard.isNPub(arg)) {
      const pubkey = String(decode(arg));
      const displayName = this.generateDisplayNameFromNPub(arg);

      return {
        npub: arg,
        pubkey,
        state: 'calculated',
        displayName,
        nip05: null,
        pictureBase64: null,
        pictureUrl: null
      };
    } else if (this.nostrGuard.isNSec(arg)) {
      const publics = this.nostrConverter.convertNSecToPublicKeys(arg);
      const displayName = this.generateDisplayNameFromNPub(publics.npub);

      return {
        npub: publics.npub,
        pubkey: publics.pubkey,
        state: 'calculated',
        displayName,
        nip05: null,
        pictureBase64: null,
        pictureUrl: null
      };
    } else {
      throw new Error('invalid string format given as argument to AccountFactory#accountCalculatedFactory', arg);
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
    const displayName = metadata?.display_name || metadata?.name || this.generateDisplayNameFromNPub(account.npub);
    const pictureUrl = metadata?.picture || null;

    return {
      ...account,
      displayName,
      state: 'essential',
      nprofile,
      metadata,
      pictureBase64: null,
      pictureUrl,
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
    const pictureUrl = account.metadata?.picture || null;

    return {
      ...account,
      nprofile,
      nip05,
      pictureUrl,
      pictureBase64: null,
      state: 'pointable'
    };
  }

  /**
   * Derivate complete loaded account from pointable account.
   * Account pointable + base64 picture.
   *
   * @param account AccountPointable
   * @param profilePictureBase64 base64 string, loaded using method linkToBase64 from FileManager service
   *
   * @returns AccountComplete, AccountPointable, Account
   */
  accountCompleteFactory(account: AccountPointable, profilePictureBase64: Base64String | null): AccountComplete {
    return { ...account, pictureBase64: profilePictureBase64, state: 'complete' };
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
  createAccount(nsec: NSec, ncryptsec: Ncryptsec, metadata: NostrMetadata | null, relays: NostrUserRelays, profilePictureBase64?: Base64String | null): AccountAuthenticable {
    const accountCalculated = this.accountCalculatedFactory(nsec);
    const essential = this.accountEssentialFactory(accountCalculated, metadata, relays);

    return {
      ...essential,
      state: 'authenticable',
      nip05: null,
      ncryptsec,
      metadata,
      pictureBase64: profilePictureBase64 || null,
      pictureUrl: metadata?.picture || null,
      relays
    };
  }

  private getPointerDetails(metadata: NostrMetadata | null, nip05: ProfilePointer | null): AccountNip05Detail {
    let relays: string[] = [],
      address: Nip05 | null = null,
      pointer = null;

    if (isNip05(metadata?.nip05)) {
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

  private generateDisplayNameFromNPub(npub: NPub): string {
    return npub.replace(/(^npub1.{3})(.+)(.{3}$)/, '$1…$3');
  }
}
