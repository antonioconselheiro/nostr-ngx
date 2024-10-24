import { Injectable } from '@angular/core';
import { verifyEvent } from 'nostr-tools';
import { isKind } from 'nostr-tools/kinds';
import { isNip05, Nip05 } from 'nostr-tools/nip05';
import { NAddr, Ncryptsec, NEvent, NostrTypeGuard, Note, NProfile, NPub, NSec } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/nostr-event.interface';

/**
 * A facade to nostr-tools guard tools with some extra util type-guards
 */
@Injectable({
  providedIn: 'root'
})
export class NostrGuard {

  isNProfile(value?: string | null): value is NProfile {
    return NostrTypeGuard.isNProfile(value);
  }

  isNEvent(value?: string | null): value is NEvent {
    return NostrTypeGuard.isNEvent(value);
  }

  isNAddr(value?: string | null): value is NAddr {
    return NostrTypeGuard.isNAddr(value);
  }

  isNSec(value?: string | null): value is NSec {
    return NostrTypeGuard.isNSec(value);
  }

  isNPub(value?: string | null): value is NPub {
    return NostrTypeGuard.isNPub(value);
  }

  isNote(value?: string | null): value is Note {
    return NostrTypeGuard.isNote(value);
  }

  isNcryptsec(value?: string | null): value is Ncryptsec {
    return NostrTypeGuard.isNcryptsec(value);
  }

  isNip05(value?: string | null): value is Nip05 {
    return isNip05(value);
  }

  isNostrEvent(event: unknown): event is NostrEvent {
    if (event && typeof event === 'object') {
      return verifyEvent(event as any);
    }

    return false;
  }

  isKind<T extends number>(event: unknown, kind: T | T[]): event is NostrEvent<T> {
    return isKind(event, kind);
  }

  isHexadecimal(stuff: string): boolean {
    return /^[a-f\d]+$/.test(stuff);
  }
}
