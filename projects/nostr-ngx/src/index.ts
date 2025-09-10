import { WindowNostr } from 'nostr-tools/nip07';

export * from './lib/configs';
export * from './lib/domain';
export * from './lib/exceptions';
export * from './lib/idb-cache';
export * from './lib/in-memory';
export * from './lib/injection-token';
export * from './lib/nostr-media';
export * from './lib/nostr-utils';
export * from './lib/pool';
export * from './lib/profile';
export * from './lib/tools';
export * from './lib/view-model-mapper';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}
