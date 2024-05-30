export * from './domain/ncryptsec.type';
export * from './domain/nip05.type';
export * from './domain/nostr-event-kind.enum';
export * from './domain/nostr-local-config.interface';
export * from './domain/nostr-public.type';
export * from './domain/nostr-secret.type';
export * from './domain/nostr-session-config.interface';
export * from './domain/relay-map.type';
export * from './shared/nostr/no-credentials-found.error';
export * from './shared/nostr/nostr-config.storage';
export * from './shared/nostr/nostr.guard';
export * from './shared/nostr/nostr.module';
export * from './shared/nostr/nostr.service';
export * from './shared/nostr/nostr.converter';
export * from './shared/nostr/relay.service';
export * from './shared/nostr/signer-not-found.error';

import { Nip07 } from 'nostr-tools/nip07'

declare global {
  interface Window {
    nostr?: Nip07;
  }
}
