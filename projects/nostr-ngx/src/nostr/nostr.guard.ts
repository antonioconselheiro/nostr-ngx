import { Injectable } from '@angular/core';
import { Nsec } from '../domain/nostr-secret.type';
import { Ncryptsec } from '../domain/ncryptsec.type';
import { Npub } from '../domain/nostr-public.type';
import { NIP05_REGEX } from 'nostr-tools/nip05';
import { Nip05 } from '../domain/nip05.type';

@Injectable({
  providedIn: 'root'
})
export class NostrGuard {

  isNostrSecret(nsec: unknown): nsec is Nsec {
    return typeof nsec === 'string' && /^nsec/.test(nsec);
  }

  isNostrPublic(npub: unknown): npub is Npub {
    return typeof npub === 'string' && /^npub/.test(npub);
  }

  isNcryptsec(ncryptsec: unknown): ncryptsec is Ncryptsec {
    return typeof ncryptsec === 'string' && /^ncryptsec/.test(ncryptsec);
  }

  isNip05(nip05: unknown): nip05 is Nip05 {
    return typeof nip05 === 'string' && NIP05_REGEX.test(nip05);
  }
}
