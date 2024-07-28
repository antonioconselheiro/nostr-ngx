import { WindowNostr } from 'nostr-tools/nip07';

export * from './domain/amount-type.type';
export * from './domain/ncryptsec.type';
export * from './domain/nip05.type';
export * from './domain/nostr-public.type';
export * from './domain/nostr-secret.type';
export * from './domain/relay-metadata.interface';
export * from './domain/relay-metadata.record';

export * from './storage/abstract-storage';
export * from './storage/configs-local.storage';
export * from './storage/configs-session.storage';
export * from './storage/nostr-local-config.interface';
export * from './storage/nostr-session-config.interface';

export * from './pool/observe-pool.fn';
export * from './pool/observe-relay.fn';
export * from './pool/smart.pool';
export * from './pool/extended.pool';

export * from './nostr/main.pool';
export * from './nostr/nostr.converter';
export * from './nostr/nostr.guard';
export * from './nostr/nostr.module';
export * from './nostr/nostr.service';
export * from './nostr/nostr-secret.crypto';
export * from './nostr/relay-config.service';

export * from './exceptions/no-credentials-found.error';
export * from './exceptions/signer-not-found.error';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
