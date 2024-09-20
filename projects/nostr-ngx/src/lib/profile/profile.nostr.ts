import { Injectable } from '@angular/core';
import { kinds, NostrEvent } from 'nostr-tools';
import { NPoolRequestOptions } from '../pool/npool-request.options';
import { NostrPool } from '../pool/nostr.pool';

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
        kinds: [Metadata],
        authors
      }
    ], opts) as Promise<Array<NostrEvent & { kind: 0 }>>;
  }

  loadProfileRelayConfig(pubkey: string): Promise<Array<NostrEvent>> {
    return this.nostrPool.query([
      {
        authors: [pubkey],
        kinds: [
          kinds.RelayList
        ],
        limit: 1
      },

      {
        authors: [pubkey],
        kinds: [kinds.SearchRelaysList],
        limit: 1
      },

      {
        authors: [pubkey],
        kinds: [kinds.BlockedRelaysList],
        limit: 1
      },

      {
        authors: [pubkey],
        kinds: [this.kindDirectMessageList],
        limit: 1
      }
    ]);
  }

  loadProfilesRelayConfig(pubkeys: Array<string>): Promise<Array<NostrEvent>> {
    return this.nostrPool.query([
      {
        authors: pubkeys,
        kinds: [
          kinds.RelayList,
          kinds.SearchRelaysList,
          kinds.BlockedRelaysList,
          this.kindDirectMessageList
        ]
      }
    ]);
  }

  async loadFullyProfileConfig(pubkey: string, opts?: NPoolRequestOptions): Promise<Array<NostrEvent>> {
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
        kinds: [10_050],
        authors: [pubkey],
        limit: 1
      }
    ], opts);
  }
}
