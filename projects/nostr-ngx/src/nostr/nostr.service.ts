import { Injectable } from '@angular/core';
import { NostrPool } from '../pool/nostr.pool';
import { IdbNStore } from '../idb-cache/idb.nstore';

@Injectable()
export class NostrService {

  constructor(
    private pool: NostrPool,
    private nstore: IdbNStore
  ) { }

}