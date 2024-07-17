import { WindowNostr } from 'nostr-tools/nip07';

export * from './domain/amount-type.type';
export * from './domain/ncryptsec.type';
export * from './domain/nip05.type';
export * from './domain/nostr-event-kind.enum';
export * from './domain/nostr-local-config.interface';
export * from './domain/nostr-public.type';
export * from './domain/nostr-secret.type';
export * from './domain/nostr-session-config.interface';
export * from './domain/relay-metadata.interface';
export * from './domain/relay-information.interface';
export * from './domain/relay-record.type';

export * from './shared/abstract-storage';
export * from './shared/nostr/configs-local.storage';
export * from './shared/nostr/configs-session.storage';
export * from './shared/nostr/abstract.pool';
export * from './shared/nostr/derivated.pool';
export * from './shared/nostr/extended.pool';
export * from './shared/nostr/smart.pool';
export * from './shared/nostr/no-credentials-found.error';
export * from './shared/nostr/nostr.converter';
export * from './shared/nostr/nostr.guard';
export * from './shared/nostr/nostr.module';
export * from './shared/nostr/nostr.service';
export * from './shared/nostr/observe-pool.fn';
export * from './shared/nostr/observe-relay.fn';
export * from './shared/nostr/pool.statefull';
export * from './shared/nostr/signer-not-found.error';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
