import { Injectable } from '@angular/core';
import { kinds, NostrEvent } from 'nostr-tools';
import { isRelayString } from './is-relay-string.regex';
import { RelayRecord } from 'nostr-tools/relay';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  private convertRelayMetadataFromTag(tag: string[]): Array<WebSocket['url']> {
    const relays = tag.filter(relay => isRelayString.test(relay));
    const list: Array<WebSocket['url']> = [];

    Object.keys(relays).forEach(relay => {
      if (relay) {
        list.push(relay);
      }
    });

    return list;
  }

  convertDirectMessageRelayEventToRelayList(event: NostrEvent & { kind: 10050 }): Array<WebSocket['url']> {
    let list: Array<WebSocket['url']> = [];
    event.tags.forEach(tag => list = [ ...list, ...this.convertRelayMetadataFromTag(tag) ]);

    return list;
  }

  convertRelayListEventToRelayRecord(event: NostrEvent & { kind: typeof kinds.RelayList }): RelayRecord {
    const record: RelayRecord = {};
    const relayTags = event.tags.filter(([type]) => type === 'r');
    relayTags.forEach(([, relay, config]) => {
      if (config === 'write') {
        record[relay] = {
          read: false,
          write: true
        };
      } else if (config === 'read') {
        record[relay] = {
          read: true,
          write: false
        };
      } else {
        record[relay] = {
          read: true,
          write: true
        };
      }
    });

    return record;
  }

  /**
   * Read relay hints in events,
   * 
   * this should not be used to parse 10002, use it specific method:
   * convertDirectMessageRelayEventToRelayList and convertRelayListEventToRelayRecord.
   *  
   * Read tag 'relays' and tag 'r', read either the relay from tag 'e' and from tag 'p'
   */
  convertEventToRelayList(event: NostrEvent): Array<WebSocket['url']> {
    const shouldIgnore = [ kinds.RelayList ].includes(event.kind);
    if (shouldIgnore) {
      return [];
    }

    const relaysFound: Array<WebSocket['url']> = [];
    event.tags.forEach(tags => {
      const [type, ...values] = tags;
      switch (type) {
        case 'relays':
          values.forEach(relay => relaysFound.push(relay));
          break;
        case 'r':
          if (values[0]) {
            relaysFound.push(values[0]);
          }
          break;
        case 'p':
        case 'e':
        case 'a':
          if (values[1]) {
            relaysFound.push(values[1]);
          }
          break;
      }
    });

    return relaysFound;
  }
}
