import { Injectable } from '@angular/core';
import { NostrSigner } from '@belomonte/nostr-credential-ngx';
import { NostrEventKind } from '@belomonte/nostr-ngx';
import { EventTemplate, NostrEvent } from 'nostr-tools';
import { IProfile } from '../../../domain/profile.interface';

@Injectable({
  providedIn: 'root'
})
export class RegisterAccountEventFactory {

  constructor(
    private nostrSigner: NostrSigner
  ) { }

  createProfileMetadata(profile: IProfile): Promise<NostrEvent> {
    const event: EventTemplate = {
      kind: NostrEventKind.Metadata,
      content: JSON.stringify(profile),
      tags: [],
      created_at: this.generateCreatedAt()
    };

    return this.nostrSigner.signEvent(event);
  }

  private generateCreatedAt(): number {
    return Math.floor(Date.now() / 1000);
  }
}
