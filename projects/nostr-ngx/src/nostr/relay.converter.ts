import { Injectable } from '@angular/core';
import { TRelayMetadataRecord } from '../domain/relay-metadata.record';
import { NostrEvent } from 'nostr-tools';
import { NostrEventKind } from '../domain/nostr-event-kind';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  constructor() { }

  private convertRelayMetadataFromRelayListMetadataEvent(event: NostrEvent): TRelayMetadataRecord {
    const record: TRelayMetadataRecord = {};
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

  private convertRelayMetadataFromTag(tag: string[]): TRelayMetadataRecord {
    const relays = tag.filter(relay => /^ws/.test(relay));
    const record: TRelayMetadataRecord = {};

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

  convertNostrEventToRelayMetadata(event: NostrEvent): TRelayMetadataRecord {
    if (event.kind === NostrEventKind.RelayList) {
      return this.convertRelayMetadataFromRelayListMetadataEvent(event);
    } else {
      let record: TRelayMetadataRecord = {};
      event.tags.forEach(tag => record = { ...record, ...this.convertRelayMetadataFromTag(tag) });

      return record;
    }
  }
}
