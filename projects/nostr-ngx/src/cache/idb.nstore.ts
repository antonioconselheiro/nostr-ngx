import { NostrEvent, NostrFilter, NostrMetadata, NStore } from '@nostrify/nostrify';
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { TNostrPublic } from '../domain/nostr-public.type';

interface NostrCache extends DBSchema {
  profileMetadata: {
    key: string,
    value: NostrMetadata & { npub: TNostrPublic; pictureB64: string; };
    indexes: {
      npub: 'npub',
      displayName: 'display_name',
      name: 'name'
    }
  },
  tagIndex: {
    key: string;
    value: {
      tag: string;
      value: string;
      eventId: string;
    };
    indexes: {
      tagAndValue: [ 'tag', 'value' ]
    }
  };
  nostrEvents: {
    key: string;
    value: NostrEvent;
    indexes: {
      pubkey: 'pubkey',
      kind: 'kind',
      content: 'content'
    }
  };
}

export class IdbNStore implements NStore {

  private db!: IDBPDatabase<NostrCache>;

  initialize(): void {
    openDB<NostrCache>('NostrCache', 1, {
      upgrade(db) {
        const eventCache = db.createObjectStore('nostrEvents', {
          keyPath: 'id',
          autoIncrement: false
        });

        eventCache.createIndex('pubkey', 'pubkey', { unique: false });
        eventCache.createIndex('kind', 'kind', { unique: false });
        eventCache.createIndex('content', 'content', { unique: false });

        const tagIndex = db.createObjectStore('tagIndex');
        tagIndex.createIndex('tagAndValue', [ 'tag', 'value' ], { unique: false });

        const profileMetadata = db.createObjectStore('profileMetadata');
        profileMetadata.createIndex('npub', 'npub', { unique: false });
        profileMetadata.createIndex('displayName', 'displayName', { unique: false });
        profileMetadata.createIndex('name', 'name', { unique: false });
      },
    }).then(db => this.db = db);
  }

  async event(event: NostrEvent): Promise<void> {
    const txEvent = this.db.transaction('nostrEvents', 'readwrite');
    const txTag = this.db.transaction('tagIndex', 'readwrite');
    const indexableTag = [ 'p', 'P', 'e', 't' ];

    await Promise.all([
      txEvent.store.put(event),
      async () => {
        for await (const tag of event.tags) {
          const [ type, value ] = tag;
          if (indexableTag.includes(type)) {
            await txTag.store.put({
              tag: type.toLowerCase(),
              value,
              eventId: event.id
            });
          }
        }
      },
      txEvent.done,
      txTag.done
    ]);
  }

  async query(filters: NostrFilter[]): Promise<NostrEvent[]> {
    // Query events.
  }

  async count(filters: NostrFilter[]): Promise<{ count: number }> {
    // Count events.
  }

  async remove(filters: NostrFilter[]): Promise<void> {
    // Remove events.
  }
}