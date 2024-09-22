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

  /**
   * @param authors array of pubkey, hexadecimal
   * @param opts optional request options
   * @returns metadata event
   */
  async loadProfile(pubkey: string, opts?: NPoolRequestOptions): Promise<NostrEvent & { kind: 0 }> {
    //  FIXME: aplicar schemas
    //  FIXME: applicar filtros de bloqueio
    const [event] = await this.nostrPool.query([
      {
        kinds: [kinds.Metadata],
        authors: [pubkey],
        limit: 1
      },
    ], opts);

    return Promise.resolve(event as NostrEvent & { kind: 0 });
  }

  /**
   * @param authors array of pubkey, hexadecimal
   * @param opts optional request options
   * @returns metadata event
   */
  loadProfiles(authors: Array<string>, opts?: NPoolRequestOptions): Promise<Array<NostrEvent & { kind: 0 }>> {
    //  FIXME: aplicar schemas
    //  FIXME: applicar filtros de bloqueio
    return this.nostrPool.query([
      {
        kinds: [kinds.Metadata],
        authors
      }
    ], opts) as Promise<Array<NostrEvent & { kind: 0 }>>;
  }

  loadProfilesConfig(pubkeys: Array<string>): Promise<Array<NostrEvent>> {
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
    ]);
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
