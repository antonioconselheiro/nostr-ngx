import { WindowNostr } from 'nostr-tools/nip07';

export * from './lib/injection-token/main-ncache.token';
export * from './lib/domain/nprofile.type';
export * from './lib/domain/naddr.type';
export * from './lib/domain/relay-list.event-kind';
export * from './lib/domain/ncryptsec.type';
export * from './lib/domain/nip05.type';
export * from './lib/domain/note.type';
export * from './lib/domain/nsec.type';
export * from './lib/domain/unauthenticated-account.interface';
export * from './lib/domain/npub.type';
export * from './lib/domain/nevent.type';
export * from './lib/config-storage/config-storage.module';
export * from './lib/config-storage/profile-session.storage';
export * from './lib/config-storage/accounts-local.storage';
export * from './lib/pool/pool.module';
export * from './lib/pool/router.service';
export * from './lib/pool/event-router-matcher.interface';
export * from './lib/pool/router-matcher.interface';
export * from './lib/pool/default.router-matcher';
export * from './lib/pool/relay-config.service';
export * from './lib/pool/npool-router.options';
export * from './lib/pool/npool-request.options';
export * from './lib/pool/facade.npool';
export * from './lib/pool/nostr.pool';
export * from './lib/idb-cache/idb-ncache.module';
export * from './lib/idb-cache/idb-nostr-event-cache.interface';
export * from './lib/idb-cache/idb.ncache';
export * from './lib/tools/nostr-date.fn';
export * from './lib/nostr-media/file-sending.interface';
export * from './lib/nostr-media/file-upload-completed.interface';
export * from './lib/nostr-media/file-processing.interface';
export * from './lib/nostr-media/media.uploader';
export * from './lib/nostr-media/file-manager.service';
export * from './lib/nostr-media/file-upload.type';
export * from './lib/nostr-media/nostr-media.module';
export * from './lib/configs/abstract-browser-storage';
export * from './lib/configs/nostr-session-config.interface';
export * from './lib/configs/configs-local.storage';
export * from './lib/configs/nostr-local-config.interface';
export * from './lib/configs/nostr-user-relays.interface';
export * from './lib/configs/configs-session.storage';
export * from './lib/exceptions/no-credentials-found.error';
export * from './lib/exceptions/signer-not-found.error';
export * from './lib/nostr/nostr.module';
export * from './lib/nostr/is-relay-string.regex';
export * from './lib/nostr/relay.converter';
export * from './lib/nostr/nostr.converter';
export * from './lib/nostr/nsec.crypto';
export * from './lib/nostr/nostr.guard';
export * from './lib/profile/profile.service';
export * from './lib/profile/profile.module';
export * from './lib/profile/nostr.signer';
export * from './lib/profile/nostr-metadata-cached.interface';
export * from './lib/profile/account-manager.service';
export * from './lib/profile/authenticated-account.observable';
export * from './lib/profile/profile.cache';
export * from './lib/profile/profile-metadata.interface';
export * from './lib/profile/profile.nostr';
export * from './lib/profile/idb-profile-cache.interface';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
