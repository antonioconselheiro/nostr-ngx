import { Injectable } from '@angular/core';
import { NostrPool } from '@belomonte/nostr-ngx';
import { kinds, NostrEvent } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { NPoolRequestOptions } from '../pool/npool-request.options';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  private readonly kindsDirectMessageList = 10050;

  constructor(
    private nostrPool: NostrPool
  ) { }

  /**
   * @param authors array of pubkey, hexadecimal
   * @param opts optional request options
   * @returns metadata event
   */
  async loadProfile(author: string, opts?: NPoolRequestOptions): Promise<NostrEvent & { kind: 0 }> {
    //  FIXME: aplicar schemas
    //  FIXME: applicar filtros de bloqueio
    const [ event ] = await this.nostrPool.query([
      {
        kinds: [ Metadata ],
        authors: [ author ],
        limit: 1
      }
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
        kinds: [ Metadata ],
        authors
      }
    ], opts) as Promise<Array<NostrEvent & { kind: 0 }>>;
  }

  loadProfileRelayConfig(pubkey: string): Promise<Array<NostrEvent>> {
    return this.nostrPool.query([
      {
        authors: [ pubkey ],
        kinds: [
          kinds.RelayList,
          kinds.SearchRelaysList,
          kinds.BlockedRelaysList,
          this.kindsDirectMessageList
        ],
        limit: 4
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
          this.kindsDirectMessageList
        ]
      }
    ]);
  }
}
