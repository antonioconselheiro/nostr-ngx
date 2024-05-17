import { SafeHtml } from '@angular/platform-browser';
import { TNostrPublic } from '../../../nostr-ngx/src/domain/nostr-public.type';
import { DataLoadType } from '../../../nostr-ngx/src/domain/data-load.type';
import { NostrUser } from '../../../nostr-ngx/src/domain/nostr-user';

export interface IProfile {
  npub: TNostrPublic;
  user: NostrUser;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  display_name?: string;
  picture?: string;
  htmlAbout?: SafeHtml;
  about?: string;
  banner?: string;
  lud16?: string;
  website?: string;
  nip05?: string;
  //  format: 1684022601
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at?: number;
  nip05valid?: boolean;
  load: DataLoadType;
}
