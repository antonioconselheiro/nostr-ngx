import { Injectable } from '@angular/core';
import { NostrMetadata } from '@nostrify/nostrify';
import { kinds, NostrEvent } from 'nostr-tools';
import { RelayRecord } from 'nostr-tools/relay';
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
    const event: NostrRawEvent = {
      kind: kinds.RelayList,
      content: '',
      tags: []
    };

    return this.nostrSigner.signEvent(event);
  }

  createSearchRelayListEvent(searchList: Array<WebSocket['url']>, currentEvent?: NostrEvent): Promise<NostrEvent> {
    const event: NostrRawEvent = {
      kind: kinds.SearchRelaysList,
      tags: [],
      content: ''
    };

    return this.nostrSigner.signEvent(event);
  }

  createPrivateDirectMessageListEvent(privateDmList: Array<WebSocket['url']>, currentEvent?: NostrEvent): Promise<NostrEvent> {
    const event: NostrRawEvent = {
      kind: 10_050,
      tags: [],
      content: ''
    };

    return this.nostrSigner.signEvent(event);
  }

  createBlockedRelayListEvent(blockedRelayList: Array<WebSocket['url']>, currentEvent?: NostrEvent): Promise<NostrEvent> {
    const event: NostrRawEvent = {
      kind: kinds.BlockedRelaysList,
      tags: [],
      content: ''
    };

    return this.nostrSigner.signEvent(event);
  }
}
