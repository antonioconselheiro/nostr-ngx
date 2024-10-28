import { Injectable } from '@angular/core';
import { kinds } from 'nostr-tools';
import { BlockedRelaysList, DirectMessageRelaysList, RelayList, SearchRelaysList } from 'nostr-tools/kinds';
import { RelayRecord } from 'nostr-tools/relay';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { Account } from '../domain/account.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { isRelayString } from './is-relay-string.regex';
import { NostrGuard } from './nostr.guard';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  constructor(
    private guard: NostrGuard
  ) { }

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

  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList>): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent<SearchRelaysList>): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent<DirectMessageRelaysList>): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList | SearchRelaysList | DirectMessageRelaysList>): Array<WebSocket['url']>;
  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList | SearchRelaysList | DirectMessageRelaysList>): Array<WebSocket['url']> {
    let list: Array<WebSocket['url']> = [];
    event.tags.forEach(tag => list = [...list, ...this.convertRelayMetadataFromTag(tag)]);

    return list;
  }

  convertRelayListEventToRelayRecord(event: NostrEvent<RelayList>): RelayRecord {
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
    const shouldIgnore = [kinds.RelayList].includes(event.kind);
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
          //  TODO: add kind 17 WebsiteReaction in nostr-tools
          if (tagValues[0] && !this.guard.isKind(event, 17)) {
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

  convertEventsToRelayConfig(
    relayEvents: Array<NostrEvent>,
    patchExistingUser?: Account
  ): { [pubkey: HexString]: NostrUserRelays } {
    const record: { [pubkey: HexString]: NostrUserRelays } = {};
    if (patchExistingUser) {
      record[patchExistingUser.pubkey] = patchExistingUser.relays;
    }

    relayEvents.forEach(event => {
      if (!record[event.pubkey]) {
        record[event.pubkey] = {};
      }

      if (this.guard.isKind(event, RelayList)) {
        record[event.pubkey].general = this.convertRelayListEventToRelayRecord(event);
      } else if (this.guard.isKind(event, DirectMessageRelaysList)) {
        record[event.pubkey].directMessage = this.convertEventToRelayList(event);
      } else if (this.guard.isKind(event, SearchRelaysList)) {
        record[event.pubkey].search = this.convertEventToRelayList(event);
      } else if (this.guard.isKind(event, BlockedRelaysList)) {
        record[event.pubkey].blocked = this.convertEventToRelayList(event);
      }
    });

    return record;
  }

  /**
   * extract write relays
   */
  extractOutboxRelays(userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>): Array<WebSocket['url']> {
    return this.extractRelaysOfRelayRecord(userRelayConfig, 'write');
  }

  /**
   * extract read relays
   */
  extractInboxRelays(userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>): Array<WebSocket['url']> {
    return this.extractRelaysOfRelayRecord(userRelayConfig, 'read');
  }

  extractRelaysOfRelayRecord(
    userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>,
    relayType: 'read' | 'write'
  ): Array<WebSocket['url']> {
    if (userRelayConfig instanceof Array) {
      return userRelayConfig.map(record => this.extractOutboxRelays(record)).flat(2);
    } else if (userRelayConfig && userRelayConfig.general) {
      const general = userRelayConfig.general;
      return Object
        .keys(general)
        .filter(relay => general[relay][relayType]);
    }

    return [];
  }
}
