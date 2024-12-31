import { Inject, Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { getPublicKey } from 'nostr-tools';
import { decode, Ncryptsec, nprofileEncode, npubEncode, NSec, ProfilePointer } from 'nostr-tools/nip19';
import { NostrConfig } from '../configs/nostr-config.interface';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountDeepLoaded } from '../domain/account/account-deep-loaded.interface';
import { AccountNip05 } from '../domain/account/account-nip05.interface';
import { UnauthenticatedAccount } from '../domain/account/unauthenticated-account.interface';
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
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays): AccountDeepLoaded;
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec: Ncryptsec): UnauthenticatedAccount;
  // eslint-disable-next-line complexity
  accountFactory(pubkey: HexString, resultset: AccountResultset | null, relays: NostrUserRelays, ncryptsec?: Ncryptsec): AccountDeepLoaded | UnauthenticatedAccount {
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
