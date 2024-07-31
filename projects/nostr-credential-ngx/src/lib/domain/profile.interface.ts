import { SafeHtml } from '@angular/platform-browser';
import { TNip05, TNostrPublic } from '@belomonte/nostr-ngx';

export interface IProfile {
  npub: TNostrPublic;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  display_name?: string;
  picture?: string;
  htmlAbout?: SafeHtml;
  about?: string;
  banner?: string;
  lud16?: string;
  website?: string;
  nip05?: TNip05;

  /**
   * format: timeestamp in seconds, ex: 1684022601 
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at?: number;
  nip05valid?: boolean;
  load: boolean;

  [customizedField: string]: any;
}
