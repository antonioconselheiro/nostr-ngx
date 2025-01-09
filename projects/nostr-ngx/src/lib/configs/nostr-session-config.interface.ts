import { NSec } from 'nostr-tools/nip19';
import { AccountSession } from '../domain/account/account-session.interface';
import { NostrUserRelays } from './nostr-user-relays.interface';

/**
 * saved in session storage
 */
export interface NostrSessionConfig {
  /**
   * current user account
   */
  account?: AccountSession;
  nsec?: NSec;

  /**
   * This property helps nostr-gui-ngx screen state, you
   * don't need use it if you have a custom form state control.
   * 
   * This property helps to not lost user relay configs if
   * he navigate to see relay details or relays events.
   * 
   * This config must be save each user change in relay
   * config form.
   * 
   * This must be removed if user save relays or if ha
   * close the configuration screen.
   * 
   * This must be not removed if user just navigate into
   * a relay url.
   */
  unsaveRelayConfig?: NostrUserRelays;
}
