export * from './domain/nostr-event-kind.enum';
export * from './shared/nostr/nostr.module';
export * from './shared/nostr/nostr.service';
export * from './shared/nostr/relay.service';
export * from './shared/nostr/nostr-config.storage';
export * from './shared/nostr/nip7.interface';
export * from './domain/data-load.enum';
export * from './domain/nostr-event-kind.enum';
export * from './domain/nostr-public.type';
export * from './domain/nostr-secret.type';
export * from './domain/nip5.type';
export * from './shared/nostr/signer-not-found.error';
export * from './shared/nostr/no-credentials-found.error';

import { INip7 } from './shared/nostr/nip7.interface';


declare global {
  interface Window {
    nostr?: INip7;
  }
}