import { Injectable } from '@angular/core';
import { NIP05_REGEX } from 'nostr-tools/nip05';
import { Nip05 } from '../domain/nip05.type';
import { NProfile } from '../domain/nprofile.type';
import { NEvent } from '../domain/nevent.type';
import { NAddr } from '../domain/naddr.type';
import { NSec } from '../domain/nsec.type';
import { NPub } from '../domain/npub.type';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { Note } from '../domain/note.type';

@Injectable({
  providedIn: 'root'
})
export class NostrGuard {

  isNProfile(value?: string | null): value is NProfile {
    return /^nprofile1[a-z\d]+$/.test(value || '');
  }

  isNEvent(value?: string | null): value is NEvent {
    return /^nevent1[a-z\d]+$/.test(value || '');
  }

  isNAddr(value?: string | null): value is NAddr {
    return /^naddr1[a-z\d]+$/.test(value || '');
  }

  isNSec(value?: string | null): value is NSec {
    return /^nsec1[a-z\d]{58}$/.test(value || '');
  }

  isNPub(value?: string | null): value is NPub {
    return /^npub1[a-z\d]{58}$/.test(value || '');
  }

  isNote(value?: string | null): value is Note {
    return /^note1[a-z\d]+$/.test(value || '');
  }

  isNcryptsec(value?: string | null): value is Ncryptsec {
    return /^ncryptsec1[a-z\d]+$/.test(value || '');
  }

  isNip05(value?: string | null): value is Nip05 {
    return NIP05_REGEX.test(value || '');
  }
}
