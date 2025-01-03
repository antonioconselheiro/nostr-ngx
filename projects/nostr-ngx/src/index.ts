import { WindowNostr } from 'nostr-tools/nip07';

export * from './lib/injection-token/nostr-config.token';
export * from './lib/injection-token/relay-router.token';
export * from './lib/injection-token/local-cache.token';
export * from './lib/domain/nostr-public-user.interface';
export * from './lib/domain/relay-list.event-kind';
export * from './lib/domain/event/nostr-nip1-event.interface';
export * from './lib/domain/event/nostr-strict-event.type';
export * from './lib/domain/event/tags/tag-pointer.type';
export * from './lib/domain/event/tags/tag-bolt11.type';
export * from './lib/domain/event/tags/tag-pointer-related.type';
export * from './lib/domain/event/tags/tag-reference.type';
export * from './lib/domain/event/tags/tag-lnurl.type';
export * from './lib/domain/event/tags/tag-zap-request.type';
export * from './lib/domain/event/tags/tag-reaction.type';
export * from './lib/domain/event/tags/tag-zap-receipt.type';
export * from './lib/domain/event/tags/tag-amount-millisats.type';
export * from './lib/domain/event/tags/tag-related.type';
export * from './lib/domain/event/tags/tag-note.type';
export * from './lib/domain/event/tags/tag-relay-list.type';
export * from './lib/domain/event/tags/tag-common.type';
export * from './lib/domain/event/strict-tag.array';
export * from './lib/domain/event/nostr-raw-event.interface';
export * from './lib/domain/event/nostr-strict-tags.array';
export * from './lib/domain/event/nostr-event.interface';
export * from './lib/domain/event/strict-tag-kinds.type';
export * from './lib/domain/event/strict-tag.type-map';
export * from './lib/domain/event/nostr-event-relation.interface';
export * from './lib/domain/event/nostr-event-tags.array';
export * from './lib/domain/event/primitive/stringified-event.type';
export * from './lib/domain/event/primitive/hex-string.type';
export * from './lib/domain/event/primitive/stringified.type';
export * from './lib/domain/account/account-complete.interface';
export * from './lib/domain/account/account-essential.interface';
export * from './lib/domain/account/account-pointable.interface';
export * from './lib/domain/account/account-nip05-detail.type';
export * from './lib/domain/account/account-not-loaded.interface';
export * from './lib/domain/account/account-viewable.interface';
export * from './lib/domain/account/account.interface';
export * from './lib/domain/account/account-authenticable.interface';
export * from './lib/domain/account/account-nip05-detail.type';
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
export * from './lib/in-memory/in-memory.ncache';
export * from './lib/in-memory/in-memory.module';
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
export * from './lib/profile/profile.proxy';
export * from './lib/profile/profile-event.factory';
export * from './lib/profile/profile.module';
export * from './lib/profile/nostr.signer';
export * from './lib/profile/account-manager.service';
export * from './lib/profile/account-resultset.type';
export * from './lib/profile/profile.cache';
export * from './lib/profile/current-account.observable';
export * from './lib/profile/profile.nostr';
export * from './lib/profile/idb-account-cache.interface';
export * from './lib/profile/account.factory';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
