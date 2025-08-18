import { Injectable } from '@angular/core';
import { BlockedRelaysList, DirectMessageRelaysList, Metadata, RelayList, SearchRelaysList } from 'nostr-tools/kinds';
import { Observable } from 'rxjs';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrEventWithOrigins } from '../domain/event/nostr-event-with-origins.interface';
import { NostrPool } from '../pool/nostr.pool';
import { PoolRequestOptions } from '../pool/pool-request.options';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  constructor(
    private nostrPool: NostrPool
  ) { }

  loadProfilesConfig(pubkeys: Array<HexString>, opts?: PoolRequestOptions): Promise<Array<NostrEventWithOrigins>> {
    //  FIXME: aplicar schemas para validar o formato do evento
    //  FIXME: aplicar filtros de bloqueio, para caso este usuário tenha bloqueado a pubkey sendo chamada
    return this.nostrPool.query([
      {
        authors: pubkeys,
        kinds: [
          Metadata,
          RelayList,
          SearchRelaysList,
          BlockedRelaysList,
          DirectMessageRelaysList
        ]
      }
    ], opts);
  }

  loadProfileConfig(pubkey: HexString, opts?: PoolRequestOptions): Promise<Array<NostrEventWithOrigins>> {
    //  FIXME: aplicar schemas para validar o formato do evento
    //  FIXME: aplicar filtros de bloqueio, para caso este usuário tenha bloqueado a pubkey sendo chamada
    return this.nostrPool.query([
      {
        kinds: [Metadata],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [RelayList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [SearchRelaysList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [BlockedRelaysList],
        authors: [pubkey],
        limit: 1
      },

      {
        kinds: [DirectMessageRelaysList],
        authors: [pubkey],
        limit: 1
      }
    ], opts);
  }

  /**
   * FIXME: maybe should receive and array
   */
  listenUserConfigUpdates(pubkey: HexString, opts?: PoolRequestOptions): Observable<NostrEventWithOrigins> {
    //  FIXME: aplicar schemas para validar o formato do evento
    //  FIXME: aplicar filtros de bloqueio, para caso este usuário tenha bloqueado a pubkey sendo chamada
    return this.nostrPool.observe([
      {
        kinds: [
          Metadata,
          RelayList,
          SearchRelaysList,
          BlockedRelaysList,
          DirectMessageRelaysList
        ],
        authors: [
          pubkey
        ]
      }
    ], {
      ...opts,
      ignoreCache: true
    });
  }
}
