import { RelayInformationTemp } from "@belomonte/nostr-ngx";

export interface IRelayConfig {
  read?: boolean;
  write?: boolean;

  /**
   * nip11 data
   */
  metadata?: RelayInformationTemp;
}
