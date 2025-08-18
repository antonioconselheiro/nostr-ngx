import { RelayRecord } from 'nostr-tools/relay';
import { RelayDomainString } from '../domain/event/relay-domain-string.type';

export interface NostrUserRelays {
  general?: RelayRecord;
  directMessage?: Array<RelayDomainString>;
  search?: Array<RelayDomainString>;
  blocked?: Array<RelayDomainString>;
}
