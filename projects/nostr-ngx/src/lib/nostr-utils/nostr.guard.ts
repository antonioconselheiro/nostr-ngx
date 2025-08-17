import { Injectable } from '@angular/core';
import { verifyEvent } from 'nostr-tools';
import { isKind } from 'nostr-tools/kinds';
import { isNip05, Nip05 } from 'nostr-tools/nip05';
import { NAddr, Ncryptsec, NEvent, NostrTypeGuard, Note, NProfile, NPub, NSec } from 'nostr-tools/nip19';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { RelayDomain } from '../domain/event/relay-domain.interface';

/**
 * A facade to nostr-tools guard tools with some extra util type-guards
 */
@Injectable({
  providedIn: 'root'
})
export class NostrGuard {

  static isNProfile(value?: unknown): value is NProfile {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNProfile(value);
  }

  static isNEvent(value?: unknown): value is NEvent {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNEvent(value);
  }

  static isNAddr(value?: unknown): value is NAddr {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNAddr(value);
  }

  static isNSec(value?: unknown): value is NSec {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNSec(value);
  }

  static isNPub(value?: unknown): value is NPub {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNPub(value);
  }

  static isNote(value?: unknown): value is Note {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNote(value);
  }

  static isNcryptsec(value?: unknown): value is Ncryptsec {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNcryptsec(value);
  }

  static isNip05(value?: unknown): value is Nip05 {
    if (typeof value !== 'string') {
      return false;
    }

    return isNip05(value);
  }

  static isNostrEvent(event: unknown): event is NostrEvent {
    if (event && typeof event === 'object') {
      return verifyEvent(event as any);
    }

    return false;
  }

  static isKind<T extends number>(event: unknown, kind: T | T[]): event is NostrEvent<T> {
    return isKind(event, kind);
  }

  static isHexadecimal(stuff: unknown): stuff is HexString {
    return typeof stuff === 'string' && /^[a-f\d]+$/.test(stuff);
  }

  static isSerializedNostrEvent(serialized: string): boolean {
    try {
      return verifyEvent(JSON.parse(serialized));
    } catch {
      return false;
    }
  }

  static isRelayString(stuff: unknown): stuff is RelayDomain {
    const isRelayStringRegex = /^wss?:\/\/[^.]+\.[^.]=/;
    return typeof stuff === 'string' && isRelayStringRegex.test(stuff);
  }

  isNProfile(value?: unknown): value is NProfile {
    return NostrGuard.isNProfile(value);
  }

  isNEvent(value?: unknown): value is NEvent {
    return NostrGuard.isNEvent(value);
  }

  isNAddr(value?: unknown): value is NAddr {
    return NostrGuard.isNAddr(value);
  }

  isNSec(value?: unknown): value is NSec {
    return NostrGuard.isNSec(value);
  }

  isNPub(value?: unknown): value is NPub {
    return NostrGuard.isNPub(value);
  }

  isNote(value?: unknown): value is Note {
    return NostrGuard.isNote(value);
  }

  isNcryptsec(value?: unknown): value is Ncryptsec {
    return NostrGuard.isNcryptsec(value);
  }

  isNip05(value?: unknown): value is Nip05 {
    return NostrGuard.isNip05(value);
  }

  isNostrEvent(event: unknown): event is NostrEvent {
    return NostrGuard.isNostrEvent(event);
  }

  isKind<T extends number>(event: unknown, kind: T | T[]): event is NostrEvent<T> {
    return NostrGuard.isKind(event, kind);
  }

  isHexadecimal(stuff: unknown): stuff is HexString {
    return NostrGuard.isHexadecimal(stuff);
  }

  isSerializedNostrEvent(serialized: string): boolean {
    return NostrGuard.isSerializedNostrEvent(serialized);
  }

  isRelayString(stuff: unknown): stuff is RelayDomain {
    return NostrGuard.isRelayString(stuff);
  }
}
