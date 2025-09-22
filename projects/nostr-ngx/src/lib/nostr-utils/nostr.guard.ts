import { Injectable } from '@angular/core';
import { verifyEvent } from 'nostr-tools';
import { isKind } from 'nostr-tools/kinds';
import { isNip05, Nip05 } from 'nostr-tools/nip05';
import { NAddr, Ncryptsec, NEvent, NostrTypeGuard, Note, NProfile, NPub, NSec } from 'nostr-tools/nip19';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';

/**
 * A facade to nostr-tools guard tools with some extra util type-guards
 */
@Injectable({
  providedIn: 'root'
})
export class NostrGuard {

  static isNProfile(value: string | null | undefined): value is NProfile {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNProfile(value);
  }

  static isNEvent(value: string | null | undefined): value is NEvent {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNEvent(value);
  }

  static isNAddr(value: string | null | undefined): value is NAddr {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNAddr(value);
  }

  static isNSec(value: string | null | undefined): value is NSec {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNSec(value);
  }

  static isNPub(value: string | null | undefined): value is NPub {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNPub(value);
  }

  static isNote(value: string | null | undefined): value is Note {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNote(value);
  }

  static isNcryptsec(value: string | null | undefined): value is Ncryptsec {
    if (typeof value !== 'string') {
      return false;
    }

    return NostrTypeGuard.isNcryptsec(value);
  }

  static isNip05(value: string | null | undefined): value is Nip05 {
    if (typeof value !== 'string') {
      return false;
    }

    return isNip05(value);
  }

  static isNostrEvent(event: object | null | undefined): event is NostrEvent {
    if (event && typeof event === 'object') {
      return verifyEvent(event as any);
    }

    return false;
  }

  static isKind<T extends number>(event: NostrEvent | null | undefined, kind: T | T[]): event is NostrEvent<T> {
    if (!event) {
      return false;
    }

    return isKind(event, kind);
  }

  static isWithRelaysKind<T extends number>(withRelays: NostrEventWithRelays | null | undefined, kind: T | T[]): withRelays is NostrEventWithRelays<T> {
    if (!withRelays) {
      return false;
    }

    return NostrGuard.isKind(withRelays.event, kind);
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

  static isRelayString(stuff: unknown): stuff is RelayDomainString {
    const isRelayStringRegex = /^wss?:\/\/[^.]+\.[^.]/;
    return typeof stuff === 'string' && isRelayStringRegex.test(stuff);
  }

  isNProfile(value: string | null | undefined): value is NProfile {
    return NostrGuard.isNProfile(value);
  }

  isNEvent(value: string | null | undefined): value is NEvent {
    return NostrGuard.isNEvent(value);
  }

  isNAddr(value: string | null | undefined): value is NAddr {
    return NostrGuard.isNAddr(value);
  }

  isNSec(value: string | null | undefined): value is NSec {
    return NostrGuard.isNSec(value);
  }

  isNPub(value: string | null | undefined): value is NPub {
    return NostrGuard.isNPub(value);
  }

  isNote(value: string | null | undefined): value is Note {
    return NostrGuard.isNote(value);
  }

  isNcryptsec(value: string | null | undefined): value is Ncryptsec {
    return NostrGuard.isNcryptsec(value);
  }

  isNip05(value: string | null | undefined): value is Nip05 {
    return NostrGuard.isNip05(value);
  }

  isNostrEvent(event: object | null | undefined): event is NostrEvent {
    return NostrGuard.isNostrEvent(event);
  }

  isKind<T extends number>(event: NostrEvent | null | undefined, kind: T | T[]): event is NostrEvent<T> {
    return NostrGuard.isKind(event, kind);
  }

  isWithRelaysKind<T extends number>(withRelays: NostrEventWithRelays | null | undefined, kind: T | T[]): withRelays is NostrEventWithRelays<T> {
    return NostrGuard.isWithRelaysKind(withRelays, kind);
  }

  isHexadecimal(stuff: string | null | undefined): stuff is HexString {
    return NostrGuard.isHexadecimal(stuff);
  }

  isSerializedNostrEvent(serialized: string): boolean {
    return NostrGuard.isSerializedNostrEvent(serialized);
  }

  isRelayString(stuff: string | null | undefined): stuff is RelayDomainString {
    return NostrGuard.isRelayString(stuff);
  }
}
