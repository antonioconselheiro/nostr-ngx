import { Injectable } from '@angular/core';
import { kinds, NostrEvent } from 'nostr-tools';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { NostrPool } from '../pool/nostr.pool';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  private readonly kindDirectMessageList = 10050;

  constructor(
    private nostrPool: NostrPool
  ) { }

  loadProfilesConfig(pubkeys: Array<string>, opts?: NPoolRequestOptions): Promise<Array<NostrEvent>> {
    return this.nostrPool.query([
      {
        authors: pubkeys,
        kinds: [
          kinds.Metadata,
          kinds.RelayList,
          kinds.SearchRelaysList,
          kinds.BlockedRelaysList,
          this.kindDirectMessageList
        ]
      }
    ], opts);
  }

  loadProfileConfig(pubkey: string, opts?: NPoolRequestOptions): Promise<Array<NostrEvent>> {
    //  FIXME: aplicar schemas
    //  FIXME: applicar filtros de bloqueio
    return this.nostrPool.query([
      {
        kinds: [kinds.Metadata],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [kinds.RelayList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [kinds.SearchRelaysList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [kinds.BlockedRelaysList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [this.kindDirectMessageList],
        authors: [pubkey],
        limit: 1
      }
    ], opts);
  }

  /**
   * FIXME: maybe should receive and array
   */
  listenUserConfigUpdates(pubkey: string): Observable<NostrEvent> {
    //  FIXME: aplicar schemas
    //  FIXME: applicar filtros de bloqueio
    return this.nostrPool.observe([
      {
        kinds: [
          kinds.Metadata,
          kinds.RelayList,
          kinds.SearchRelaysList,
          kinds.BlockedRelaysList,
          this.kindDirectMessageList
        ],
        authors: [
          pubkey
        ]
      }
    ], {
      ignoreCache: true
    });
  }
}
