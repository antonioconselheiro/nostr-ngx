import { Injectable } from '@angular/core';
import { kinds } from 'nostr-tools';
import { BlockedRelaysList, DirectMessageRelaysList, RelayList, SearchRelaysList } from 'nostr-tools/kinds';
import { RelayRecord } from 'nostr-tools/relay';
import { NostrUserRelays } from '../configs/nostr-user-relays.interface';
import { AccountSession } from '../domain/account/compose/account-session.type';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { RelayDomain } from '../domain/event/relay-domain.interface';
import { NostrEventOrigins } from '../domain/event/nostr-event-origins.interface';
import { NostrGuard } from './nostr.guard';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  constructor(
    private guard: NostrGuard
  ) { }

  private convertRelayMetadataFromTag(tag: string[]): Array<RelayDomain> {
    const relays = tag.filter((relay): relay is RelayDomain => this.guard.isRelayString(relay));
    const list: Array<RelayDomain> = [];

    Object.values(relays).forEach(relay => {
      if (relay) {
        list.push(relay);
      }
    });

    return list;
  }

  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList>): Array<RelayDomain>;
  convertRelayEventToRelayList(event: NostrEvent<SearchRelaysList>): Array<RelayDomain>;
  convertRelayEventToRelayList(event: NostrEvent<DirectMessageRelaysList>): Array<RelayDomain>;
  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList | SearchRelaysList | DirectMessageRelaysList>): Array<RelayDomain>;
  convertRelayEventToRelayList(event: NostrEvent<BlockedRelaysList | SearchRelaysList | DirectMessageRelaysList>): Array<RelayDomain> {
    let list: Array<RelayDomain> = [];
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
  convertEventToRelayList(event: NostrEvent): Array<RelayDomain> {
    const shouldIgnore = [kinds.RelayList].includes(event.kind);
    if (shouldIgnore) {
      return [];
    }

    const relaysFound: Array<RelayDomain> = [];
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
    resultsets: Array<NostrEventOrigins>,
    patchExistingUser?: AccountSession
  ): { [pubkey: HexString]: NostrUserRelays } {
    const record: { [pubkey: HexString]: NostrUserRelays } = {};
    if (patchExistingUser) {
      record[patchExistingUser.pubkey] = patchExistingUser.relays;
    }

    resultsets.forEach(resultset => {
      if (!record[resultset.event.pubkey]) {
        record[resultset.event.pubkey] = {};
      }

      if (this.guard.isKind(resultset, RelayList)) {
        record[resultset.pubkey].general = this.convertRelayListEventToRelayRecord(resultset);
      } else if (this.guard.isKind(resultset, DirectMessageRelaysList)) {
        record[resultset.pubkey].directMessage = this.convertEventToRelayList(resultset);
      } else if (this.guard.isKind(resultset, SearchRelaysList)) {
        record[resultset.pubkey].search = this.convertEventToRelayList(resultset);
      } else if (this.guard.isKind(resultset, BlockedRelaysList)) {
        record[resultset.pubkey].blocked = this.convertEventToRelayList(resultset);
      }
    });

    return record;
  }

  /**
   * extract write relays
   */
  extractOutboxRelays(userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>): Array<RelayDomain> {
    return this.extractRelaysOfRelayRecord(userRelayConfig, 'write');
  }

  /**
   * extract read relays
   */
  extractInboxRelays(userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>): Array<RelayDomain> {
    return this.extractRelaysOfRelayRecord(userRelayConfig, 'read');
  }

  extractRelaysOfRelayRecord(
    userRelayConfig: NostrUserRelays | null | Array<NostrUserRelays | null>,
    relayType: 'read' | 'write'
  ): Array<RelayDomain> {
    if (userRelayConfig instanceof Array) {
      return userRelayConfig.map(record => this.extractOutboxRelays(record)).flat(2);
    } else if (userRelayConfig && userRelayConfig.general) {
      const general = userRelayConfig.general;
      return Object
        .keys(general)
        .filter((relay): relay is RelayDomain => {
          if (this.guard.isRelayString(relay)) {
            return general[relay][relayType];
          }

          return false;
        });
    }

    return [];
  }
}
