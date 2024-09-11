import { Injectable } from '@angular/core';
import { kinds, NostrEvent } from 'nostr-tools';
import { isRelayString } from './is-relay-string.regex';
import { RelayRecord } from 'nostr-tools/relay';

@Injectable({
  providedIn: 'root'
})
export class RelayConverter {

  private convertRelayMetadataFromRelayListMetadataEvent(event: NostrEvent): RelayRecord {
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

  private convertRelayMetadataFromTag(tag: string[]): RelayRecord {
    const relays = tag.filter(relay => isRelayString.test(relay));
    const record: RelayRecord = {};

    Object.keys(relays).forEach(relay => {
      if (relay) {
        record[relay] = {
          read: true,
          write: false
        };
      }
    });

    return record;
  }

  /**
   * FIXME: este cast deve se aplicar somente para 10002, outros tipos de evento devem retornar null
   * tzlvéz eu deva incluir algo na assinatura do método para forçar somente eventos 10002 já validados
   */
  convertNostrEventToRelayMetadata(event: NostrEvent): RelayRecord {
    if (event.kind === kinds.RelayList) {
      return this.convertRelayMetadataFromRelayListMetadataEvent(event);
    } else {
      let record: RelayRecord = {};
      event.tags.forEach(tag => record = { ...record, ...this.convertRelayMetadataFromTag(tag) });

      return record;
    }
  }
}
