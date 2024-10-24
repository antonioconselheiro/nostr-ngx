import { WindowNostr } from 'nostr-tools/nip07';

export * from './lib/injection-token/main-ncache.token';
export * from './lib/injection-token/nostr-config.token';
export * from './lib/injection-token/relay-router.token';
export * from './lib/domain/account.interface';
export * from './lib/domain/nostr-public-user.interface';
export * from './lib/domain/nostr-raw-event.interface';
export * from './lib/domain/relay-list.event-kind';
export * from './lib/domain/nostr-event.interface';
export * from './lib/domain/hex-string.interface';
export * from './lib/domain/unauthenticated-account.interface';
export * from './lib/pool/relay-router.service';
export * from './lib/pool/relay-local-config.service';
export * from './lib/pool/pool.module';
export * from './lib/pool/event-router-matcher.interface';
export * from './lib/pool/router-matcher.interface';
export * from './lib/pool/default.router-matcher';
export * from './lib/pool/npool-router.options';
export * from './lib/pool/npool-request.options';
export * from './lib/pool/facade.npool';
export * from './lib/pool/nostr.pool';
export * from './lib/idb-cache/idb-ncache.module';
export * from './lib/idb-cache/idb-nostr-event-cache.interface';
export * from './lib/idb-cache/idb.ncache';
export * from './lib/tools/unix-date.fn';
export * from './lib/nostr-media/file-sending.interface';
export * from './lib/nostr-media/file-upload-completed.interface';
export * from './lib/nostr-media/file-processing.interface';
export * from './lib/nostr-media/media.uploader';
export * from './lib/nostr-media/file-manager.service';
export * from './lib/nostr-media/file-upload.type';
export * from './lib/nostr-media/nostr-media.module';
export * from './lib/nostr-utils/is-relay-string.regex';
export * from './lib/nostr-utils/nostr-utils.module';
export * from './lib/nostr-utils/relay.converter';
export * from './lib/nostr-utils/nostr.converter';
export * from './lib/nostr-utils/nsec.crypto';
export * from './lib/nostr-utils/nostr.guard';
export * from './lib/configs/nostr-user-relays.interface';
export * from './lib/configs/nostr-config.interface';
export * from './lib/configs/nostr.module';
export * from './lib/configs/profile-session.storage';
export * from './lib/configs/abstract-browser-storage';
export * from './lib/configs/nostr.config';
export * from './lib/configs/nostr-session-config.interface';
export * from './lib/configs/accounts-local.storage';
export * from './lib/configs/nostr-local-config.interface';
export * from './lib/exceptions/no-credentials-found.error';
export * from './lib/exceptions/not-supported-by-signer.error';
export * from './lib/exceptions/signer-not-found.error';
export * from './lib/profile/profile.service';
export * from './lib/profile/profile-event.factory';
export * from './lib/profile/profile.module';
export * from './lib/profile/nostr.signer';
export * from './lib/profile/account-manager.service';
export * from './lib/profile/account-resultset.type';
export * from './lib/profile/profile.cache';
export * from './lib/profile/current-account.observable';
export * from './lib/profile/profile.nostr';
export * from './lib/profile/idb-profile-cache.interface';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
