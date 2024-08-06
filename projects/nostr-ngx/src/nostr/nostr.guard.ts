import { Injectable } from '@angular/core';
import { TNostrSecret } from '../domain/nostr-secret.type';
import { TNcryptsec } from '../domain/ncryptsec.type';
import { TNostrPublic } from '../domain/nostr-public.type';
import { NIP05_REGEX } from 'nostr-tools/nip05';
import { TNip05 } from '../domain/nip05.type';

@Injectable({
  providedIn: 'root'
})
export class NostrGuard {

  isNostrSecret(nsec: unknown): nsec is TNostrSecret {
    return typeof nsec === 'string' && /^nsec/.test(nsec);
  }

  isNostrPublic(npub: unknown): npub is TNostrPublic {
    return typeof npub === 'string' && /^npub/.test(npub);
  }

  isNcryptsec(ncryptsec: unknown): ncryptsec is TNcryptsec {
    return typeof ncryptsec === 'string' && /^ncryptsec/.test(ncryptsec);
  }

  isNip05(nip05: unknown): nip05 is TNip05 {
    return typeof nip05 === 'string' && NIP05_REGEX.test(nip05);
  }
}
