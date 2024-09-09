import { WindowNostr } from 'nostr-tools/nip07';

export * from './domain/nostr-public.type';
export * from './domain/relay-metadata.interface';
export * from './domain/nostr-secret.type';
export * from './domain/relay-metadata.record';
export * from './domain/ncryptsec.type';
export * from './domain/nip05.type';
export * from './domain/nostr-event-kind';

export * from './configs/abstract-browser-storage';
export * from './configs/nostr-session-config.interface';
export * from './configs/configs-local.storage';
export * from './configs/nostr-local-config.interface';
export * from './configs/configs-session.storage';

export * from './exceptions/no-credentials-found.error';
export * from './exceptions/signer-not-found.error';

export * from './nostr-media/file-manager.service';
export * from './nostr-media/file-processing.interface';
export * from './nostr-media/file-sending.interface';
export * from './nostr-media/file-upload-completed.interface';
export * from './nostr-media/file-upload.type';
export * from './nostr-media/media.uploader';
export * from './nostr-media/nostr-media.module';

export * from './nostr/nostr.module';
export * from './nostr/nostr.service';
export * from './nostr/nostr.converter';
export * from './pool/relay-config.service';
export * from './nostr/nostr-secret.crypto';
export * from './nostr/nostr.guard';
export * from './pool/main.pool';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
