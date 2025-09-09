import { Injectable } from '@angular/core';
import { kinds } from 'nostr-tools';
import { BlockedRelaysList, DirectMessageRelaysList, RelayList, SearchRelaysList } from 'nostr-tools/kinds';
import { RelayRecord } from 'nostr-tools/relay';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountSession } from '../domain/account/compose/account-session.type';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';
import { NostrGuard } from './nostr.guard';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  constructor(
    private guard: NostrGuard
  ) { }

  private convertRelayMetadataFromTag(tag: string[]): Array<RelayDomainString> {
    const relays = tag.filter((relay): relay is RelayDomainString => this.guard.isRelayString(relay));
    const list: Array<RelayDomainString> = [];

    Object.values(relays).forEach(relay => {
      if (relay) {
        list.push(relay);
      }
    });

    return list;
  }

  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList>): Array<RelayDomainString>;
  convertRelayEventToRelayList(event: NostrEvent<SearchRelaysList>): Array<RelayDomainString>;
  convertRelayEventToRelayList(event: NostrEvent<DirectMessageRelaysList>): Array<RelayDomainString>;
  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList | SearchRelaysList | DirectMessageRelaysList>): Array<RelayDomainString>;
  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList | SearchRelaysList | DirectMessageRelaysList>): Array<RelayDomainString> {
    let list: Array<RelayDomainString> = [];
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
  convertEventToRelayList(event: NostrEvent): Array<RelayDomainString> {
    const shouldIgnore = [kinds.RelayList].includes(event.kind);
    if (shouldIgnore) {
      return [];
    }

    const relaysFound: Array<RelayDomainString> = [];
    event.tags.forEach(tags => {
      const [type, ...tagValues] = tags;
      switch (type) {
        case 'relays':
          tagValues.forEach(relay => {
            if (this.guard.isRelayString(relay)) {
              relaysFound.push(relay);
            }
          });
          break;
        case 'r':
          //  TODO: add kind 17 WebsiteReaction in nostr-tools
          if (this.guard.isRelayString(tagValues[0]) && !this.guard.isKind(event, 17)) {
            relaysFound.push(tagValues[0]);
          }
          break;
        case 'p':
        case 'e':
        case 'a':
          if (this.guard.isRelayString(tagValues[1])) {
            relaysFound.push(tagValues[1]);
          }
          break;
      }
    });

    return relaysFound;
  }

  convertEventsToRelayConfig(
    resultsets: Array<NostrEventWithRelays>,
    patchExistingUser?: AccountSession
  ): { [pubkey: HexString]: NostrUserRelays } {
    const record: { [pubkey: HexString]: NostrUserRelays } = {};
    if (patchExistingUser) {
      record[patchExistingUser.pubkey] = patchExistingUser.relays;
    }

    resultsets.forEach(resultset => {
      const event = resultset.event;
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
  extractOutboxRelays(userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>): Array<RelayDomainString> {
    return this.extractRelaysOfRelayRecord(userRelayConfig, 'write');
  }

  /**
   * extract read relays
   */
  extractInboxRelays(userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>): Array<RelayDomainString> {
    return this.extractRelaysOfRelayRecord(userRelayConfig, 'read');
  }

  extractRelaysOfRelayRecord(
    userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>,
    relayType: 'read' | 'write'
  ): Array<RelayDomainString> {
    if (userRelayConfig instanceof Array) {
      return userRelayConfig.map(record => this.extractOutboxRelays(record)).flat(2);
    } else if (userRelayConfig && userRelayConfig.general) {
      const general = userRelayConfig.general;
      return Object
        .keys(general)
        .filter((relay): relay is RelayDomainString => {
          if (this.guard.isRelayString(relay)) {
            return general[relay][relayType];
          }

          return false;
        });
    }

    return [];
  }
}
