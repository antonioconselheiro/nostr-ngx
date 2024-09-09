import { Injectable } from '@angular/core';
import { UserRelayRecord } from '../domain/user-relay.record';
import { NostrEvent } from 'nostr-tools';
import { NostrEventKind } from '../domain/nostr-event-kind';
import { isRelayString } from './is-relay-string.regex';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  private convertRelayMetadataFromRelayListMetadataEvent(event: NostrEvent): UserRelayRecord {
    const record: UserRelayRecord = {};
    const relayTags = event.tags.filter(([type]) => type === 'r');
    relayTags.forEach(([, relay, config]) => {
      if (config === 'write') {
        record[relay] = {
          url: relay,
          read: false,
          write: true
        };
      } else if (config === 'read') {
        record[relay] = {
          url: relay,
          read: true,
          write: false
        };
      } else {
        record[relay] = {
          url: relay,
          read: true,
          write: true
        };
      }
    });

    return record;
  }

  private convertRelayMetadataFromTag(tag: string[]): UserRelayRecord {
    const relays = tag.filter(relay => isRelayString.test(relay));
    const record: UserRelayRecord = {};

    Object.keys(relays).forEach(relay => {
      if (relay) {
        record[relay] = {
          url: relay,
          read: true,
          write: false
        };
      }
    });

    return record;
  }

  convertNostrEventToRelayMetadata(event: NostrEvent): UserRelayRecord {
    if (event.kind === NostrEventKind.RelayList) {
      return this.convertRelayMetadataFromRelayListMetadataEvent(event);
    } else {
      let record: UserRelayRecord = {};
      event.tags.forEach(tag => record = { ...record, ...this.convertRelayMetadataFromTag(tag) });

      return record;
    }
  }
}
