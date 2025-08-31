import { Injectable } from '@angular/core';
import { kinds } from 'nostr-tools';
import { DirectMessageRelaysList } from 'nostr-tools/kinds';
import { RelayRecord } from 'nostr-tools/relay';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { NostrRawEvent } from '../domain/event/nostr-raw-event.interface';
import { NostrSigner } from './nostr.signer';
import { NostrMetadata } from '../domain/account/nostr-metadata.type';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';

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

  createSearchRelayListEvent(searchList: Array<RelayDomainString>, currentEvent?: NostrEvent): Promise<NostrEvent> {
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

  createPrivateDirectMessageListEvent(privateDmList: Array<RelayDomainString>, currentEvent?: NostrEvent): Promise<NostrEvent> {
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

  createBlockedRelayListEvent(blockedRelayList: Array<RelayDomainString>, currentEvent?: NostrEvent): Promise<NostrEvent> {
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
