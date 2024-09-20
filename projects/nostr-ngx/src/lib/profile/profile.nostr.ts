import { Injectable } from '@angular/core';
import { NostrGuard, NostrPool, NPub } from '@belomonte/nostr-ngx';
import { nip19, NostrEvent } from 'nostr-tools';
import { Metadata } from 'nostr-tools/kinds';
import { NPoolRequestOptions } from '../pool/npool-request.options';

@Injectable({
  providedIn: 'root'
})
export class ProfileNostr {

  constructor(
    private guard: NostrGuard,
    private nostrPool: NostrPool
  ) { }

  loadProfiles(npubs: Array<NPub | string>, opts?: NPoolRequestOptions): Promise<Array<NostrEvent & { kind: 0 }>> {
    const authors = npubs.map(pubkey => this.guard.isNPub(pubkey) ? String(nip19.decode(pubkey).data) : pubkey);
    //  FIXME: aplicar schemas
    //  FIXME: applicar filtros de bloqueio
    return this.nostrPool.query([
      {
        kinds: [ Metadata ], authors
      }
    ], opts) as Promise<Array<NostrEvent & { kind: 0 }>>;
  }
}
