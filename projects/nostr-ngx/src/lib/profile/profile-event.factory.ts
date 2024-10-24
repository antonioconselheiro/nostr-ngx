import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { kinds } from 'nostr-tools';
import { DirectMessageRelaysList } from 'nostr-tools/kinds';
import { RelayRecord } from 'nostr-tools/relay';
import { NostrEvent } from '../domain/nostr-event.interface';
import { NostrRawEvent } from '../domain/nostr-raw-event.interface';
import { NostrSigner } from './nostr.signer';

@Injectable({
  providedIn: 'root'
})
export class ProfileEventFactory {

  constructor(
    private nostrSigner: NostrSigner
  ) { }

  createProfileMetadata(profile: NostrMetadata): Promise<NostrEvent> {
    const event: NostrRawEvent = {
      kind: kinds.Metadata,
      content: JSON.stringify(profile),
      tags: []
    };

    return this.nostrSigner.signEvent(event);
  }

  createRelayEvent(relayRecord: RelayRecord, currentEvent?: NostrEvent): Promise<NostrEvent> {
    let content = '';
    let tags: string[][] = [];

    if (currentEvent) {
      content = currentEvent.content;
      tags = currentEvent.tags.filter(([type]) => type !== 'r');
    }

    Object.keys(relayRecord).forEach(relay => {
      const config = relayRecord[relay];
      if (config.read && config.write) {
        tags.push(['r', relay]);
      } else if (config.read) {
        tags.push(['r', relay, 'read']);
      } else if (config.write) {
        tags.push(['r', relay, 'write']);
      }
    });

    const event: NostrRawEvent = {
      kind: kinds.RelayList,
      content,
      tags
    };

    return this.nostrSigner.signEvent(event);
  }

  createSearchRelayListEvent(searchList: Array<WebSocket['url']>, currentEvent?: NostrEvent): Promise<NostrEvent> {
    let content = '';
    let tags: string[][] = [];

    if (currentEvent) {
      content = currentEvent.content;
      tags = currentEvent.tags.filter(([type]) => type !== 'relays');
    }

    tags.push(['relays', ...searchList]);

    const event: NostrRawEvent = {
      kind: kinds.SearchRelaysList,
      content,
      tags
    };

    return this.nostrSigner.signEvent(event);
  }

  createPrivateDirectMessageListEvent(privateDmList: Array<WebSocket['url']>, currentEvent?: NostrEvent): Promise<NostrEvent> {
    let content = '';
    let tags: string[][] = [];

    if (currentEvent) {
      content = currentEvent.content;
      tags = currentEvent.tags.filter(([type]) => type !== 'relays');
    }

    tags.push(['relays', ...privateDmList]);

    const event: NostrRawEvent = {
      kind: DirectMessageRelaysList,
      content,
      tags
    };

    return this.nostrSigner.signEvent(event);
  }

  createBlockedRelayListEvent(blockedRelayList: Array<WebSocket['url']>, currentEvent?: NostrEvent): Promise<NostrEvent> {
    let content = '';
    let tags: string[][] = [];

    if (currentEvent) {
      content = currentEvent.content;
      tags = currentEvent.tags.filter(([type]) => type !== 'relays');
    }

    tags.push(['relays', ...blockedRelayList]);

    const event: NostrRawEvent = {
      kind: kinds.BlockedRelaysList,
      content,
      tags
    };

    return this.nostrSigner.signEvent(event);
  }
}
