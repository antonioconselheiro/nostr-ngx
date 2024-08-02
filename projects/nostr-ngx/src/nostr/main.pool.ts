import { Injectable } from '@angular/core';
import { SmartPool } from '../pool/smart.pool';

/**
 * To restart main pool with new user configs exec:
 * 
 * this.relayConfigService
 *     .getCurrentUserRelays()
 *     .then(relays => this.mainPool.reuse(relays));
 * 
 * This code was not included in MainPool to avoid circular dependency
 */
@Injectable({
  providedIn: 'root'
})
export class MainPool extends SmartPool {

  constructor() {
    super();
  }
}
