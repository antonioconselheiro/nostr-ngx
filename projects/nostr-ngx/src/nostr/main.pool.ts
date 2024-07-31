import { Injectable } from '@angular/core';
import { SmartPool } from '../pool/smart.pool';
import { RelayConfigService } from './relay-config.service';

@Injectable({
  providedIn: 'root'
})
export class MainPool extends SmartPool {

  constructor(
    private relayConfigService: RelayConfigService
  ) {
    super();
    this.restart();
  }

  /**
   * Updates pool with current user relays config
   */
  restart(): void {
    this.relayConfigService.getCurrentUserRelays().then(relays => {
      this.reuse(relays);
    });
  }
}
