import { Injectable } from '@angular/core';
import { kinds, NostrEvent } from 'nostr-tools';
import { isRelayString } from './is-relay-string.regex';
import { RelayRecord } from 'nostr-tools/relay';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { NostrGuard } from './nostr.guard';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  constructor(
    private guard: NostrGuard
  ) {}

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

  convertRelayEventToRelayList(event: NostrEvent & { kind: 10006 }): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent & { kind: 10007 }): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent & { kind: 10050 }): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent & { kind: 10006 | 10007 | 10050 }): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent & { kind: 10006 | 10007 | 10050 }): Array<WebSocket['url']> {
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
   * convertRelayListEventToRelayRecord.
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
      const [type, ...tagValues] = tags;
      switch (type) {
        case 'relays':
          tagValues.forEach(relay => relaysFound.push(relay));
          break;
        case 'r':
          if (tagValues[0]) {
            relaysFound.push(tagValues[0]);
          }
          break;
        case 'p':
        case 'e':
        case 'a':
          if (tagValues[1]) {
            relaysFound.push(tagValues[1]);
          }
          break;
      }
    });

    return relaysFound;
  }

  convertEventsToRelayConfig(relayEvents: Array<NostrEvent>): { [pubkey: string]: NostrUserRelays } {
    const record: { [pubkey: string]: NostrUserRelays } = {};
    relayEvents.forEach(event => {
      if (this.guard.isKind(event, kinds.RelayList)) {
        record[event.pubkey].general = this.convertRelayListEventToRelayRecord(event);
      } else if (this.guard.isKind(event, 10_050)) {
        record[event.pubkey].directMessage = this.convertEventToRelayList(event);
      } else if (this.guard.isKind(event, kinds.SearchRelaysList)) {
        record[event.pubkey].search = this.convertEventToRelayList(event);
      } else if (this.guard.isKind(event, kinds.BlockedRelaysList)) {
        record[event.pubkey].blocked = this.convertEventToRelayList(event);
      }
    });

    return record;
  }
}
