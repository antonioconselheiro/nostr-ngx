import { RelayRecord } from 'nostr-tools/relay';
import { RelayDomain } from '../domain/event/relay-domain.interface';

export interface NostrUserRelays {
  general?: RelayRecord;
  directMessage?: Array<RelayDomain>;
  search?: Array<RelayDomain>;
  blocked?: Array<RelayDomain>;
}
