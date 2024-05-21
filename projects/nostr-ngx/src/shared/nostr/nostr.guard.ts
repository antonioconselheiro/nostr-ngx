import { Injectable } from '@angular/core';
import { TNostrSecret } from '../../domain/nostr-secret.type';
import { TNcryptsec } from '../../domain/ncryptsec.type';
import { TNostrPublic } from '../../domain/nostr-public.type';

@Injectable()
export class NostrGuard {

  isNostrSecret(nsec: string): nsec is TNostrSecret {
    return /^nsec/.test(nsec);
  }

  isNostrPublic(npub: string): npub is TNostrPublic {
    return /^npub/.test(npub);
  }

  isNcryptsec(ncryptsec: string): ncryptsec is TNcryptsec {
    return /^ncryptsec/.test(ncryptsec);
  }
}
