import { Injectable } from '@angular/core';
import { MainPool } from '../pool/main.pool';
import { IdbNStore } from '../idb-cache/idb.nstore';

@Injectable()
export class NostrService {

  constructor(
    private pool: MainPool,
    private nstore: IdbNStore
  ) { }

}