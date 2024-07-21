import { Injectable } from '@angular/core';
import { TNostrSecret } from '../domain/nostr-secret.type';
import { TNcryptsec } from '../domain/ncryptsec.type';
import { TNostrPublic } from '../domain/nostr-public.type';

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
}
