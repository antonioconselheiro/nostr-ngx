import { Injectable } from '@angular/core';
import { BlockedRelaysList, DirectMessageRelaysList, Metadata, RelayList, SearchRelaysList } from 'nostr-tools/kinds';
import { Observable } from 'rxjs';
import { HexString } from '../domain/event/primitive/hex-string.type';
import { NostrEvent } from '../domain/event/nostr-event.interface';
import { NostrPool } from '../pool/nostr.pool';
import { NPoolRequestOptions } from '../pool/npool-request.options';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  constructor(
    private nostrPool: NostrPool
  ) { }

  loadProfilesConfig(pubkeys: Array<HexString>, opts?: NPoolRequestOptions): Promise<Array<NostrEvent>> {
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

  loadProfileConfig(pubkey: HexString, opts?: NPoolRequestOptions): Promise<Array<NostrEvent>> {
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
  listenUserConfigUpdates(pubkey: HexString, opts?: NPoolRequestOptions): Observable<NostrEvent> {
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
