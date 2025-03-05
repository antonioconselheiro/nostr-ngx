import { Injectable } from '@angular/core';
import { verifyEvent } from 'nostr-tools';
import { isKind } from 'nostr-tools/kinds';
import { isNip05, Nip05 } from 'nostr-tools/nip05';
import { NAddr, Ncryptsec, NEvent, NostrTypeGuard, Note, NProfile, NPub, NSec } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';

/**
 * A facade to nostr-tools guard tools with some extra util type-guards
 */
@Injectable({
  providedIn: 'root'
})
export class NostrGuard {

  isNProfile(value?: unknown): value is NProfile {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNProfile(value);
  }

  isNEvent(value?: unknown): value is NEvent {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNEvent(value);
  }

  isNAddr(value?: unknown): value is NAddr {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNAddr(value);
  }

  isNSec(value?: unknown): value is NSec {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNSec(value);
  }

  isNPub(value?: unknown): value is NPub {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNPub(value);
  }

  isNote(value?: unknown): value is Note {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNote(value);
  }

  isNcryptsec(value?: unknown): value is Ncryptsec {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNcryptsec(value);
  }

  isNip05(value?: unknown): value is Nip05 {
    if (typeof value !== 'string') {
      return false;
    }

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

  isHexadecimal(stuff: unknown): stuff is HexString {
    return typeof stuff === 'string' && /^[a-f\d]+$/.test(stuff);
  }

  isSerializedNostrEvent(serialized: string): boolean {
    try {
      return verifyEvent(JSON.parse(serialized));
    } catch {
      return false;
    }
  }
}
