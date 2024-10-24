import { BlockedRelaysList, SearchRelaysList, DirectMessageRelaysList } from 'nostr-tools/kinds';

//  FIXME: send these to nostr-tools if it don't have
export type WikiRelayList = 10102;
export type RelayListEventKind = BlockedRelaysList | SearchRelaysList | DirectMessageRelaysList | WikiRelayList;