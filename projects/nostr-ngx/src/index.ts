import { WindowNostr } from 'nostr-tools/nip07';

export * from './injection-token/io-cache-nstore.token';
export * from './injection-token/in-memory-ncache.token';
export * from './domain/nprofile.type';
export * from './domain/naddr.type';
export * from './domain/relay-list.event-kind';
export * from './domain/ncryptsec.type';
export * from './domain/nip05.type';
export * from './domain/note.type';
export * from './domain/nsec.type';
export * from './domain/npub.type';
export * from './domain/nevent.type';
export * from './pool/pool.module';
export * from './pool/router.service';
export * from './pool/event-router-matcher.interface';
export * from './pool/router-matcher.interface';
export * from './pool/default.router-matcher';
export * from './pool/relay-config.service';
export * from './pool/npool-router.options';
export * from './pool/npool-request.options';
export * from './pool/facade.npool';
export * from './pool/nostr.pool';
export * from './idb-cache/idb.nstore';
export * from './idb-cache/ncache-default.params';
export * from './idb-cache/idb.filter';
export * from './idb-cache/idb-cache.module';
export * from './idb-cache/nostr-cache.interface';
export * from './in-memory-cache/in-memory.ncache';
export * from './in-memory-cache/in-memory-cache.module';
export * from './tools/nostr-date.fn';
export * from './nostr-media/file-sending.interface';
export * from './nostr-media/file-upload-completed.interface';
export * from './nostr-media/file-processing.interface';
export * from './nostr-media/media.uploader';
export * from './nostr-media/file-manager.service';
export * from './nostr-media/file-upload.type';
export * from './nostr-media/nostr-media.module';
export * from './configs/abstract-browser-storage';
export * from './configs/nostr-session-config.interface';
export * from './configs/configs-local.storage';
export * from './configs/nostr-local-config.interface';
export * from './configs/configs-session.storage';
export * from './exceptions/no-credentials-found.error';
export * from './exceptions/signer-not-found.error';
export * from './nostr/nostr.module';
export * from './nostr/is-relay-string.regex';
export * from './nostr/relay.converter';
export * from './nostr/nostr.service';
export * from './nostr/nostr.converter';
export * from './nostr/nostr-secret.crypto';
export * from './nostr/nostr.guard';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
