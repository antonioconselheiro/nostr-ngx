import { Injectable } from '@angular/core';
import { EventTemplate, kinds, NostrEvent } from 'nostr-tools';
import { NostrSigner } from '../../../profile-service/nostr.signer';
import { NostrMetadata } from '@nostrify/nostrify';

@Injectable({
  providedIn: 'root'
})
export class RegisterAccountEventFactory {

  constructor(
    private nostrSigner: NostrSigner
  ) { }

  createProfileMetadata(profile: NostrMetadata): Promise<NostrEvent> {
    const event: EventTemplate = {
      kind: kinds.Metadata,
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
