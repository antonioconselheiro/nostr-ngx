import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NostrPool } from '@belomonte/nostr-ngx';
import { Event, EventTemplate, finalizeEvent, generateSecretKey, getPublicKey, kinds, nip19, NostrEvent } from 'nostr-tools';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pool-interact',
  templateUrl: './pool-interact.component.html',
  styleUrl: './pool-interact.component.scss'
})
export class PoolInteractComponent {

  listening: Subscription | null = null;
  listedEvents: Array<NostrEvent> = [];

  templateMetadata: EventTemplate = {
    kind: kinds.Metadata,
    created_at: Math.floor(new Date().getTime() / 1000),
    content: "{\"name\":\"António Vicente\"}",
    tags: []
  };

  templateText: EventTemplate = {
    kind: kinds.ShortTextNote,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [
      ["t", "hashtag"]
    ],
    content: "#hashtag"
  };

  templateUserStatuses: EventTemplate = {
    kind: kinds.UserStatuses,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [
      ["d", "general"],
      ["t", "hashtag"]
    ],
    content: "my status #hashtag"
  };

  templateReact: EventTemplate = {
    kind: kinds.Reaction,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [],
    content: "+"
  };

  templateRepost: EventTemplate = {
    kind: kinds.Repost,
    created_at: Math.floor(new Date().getTime() / 1000),
    content: "#hashtag",
    tags: []
  };

  templateDelete: EventTemplate = {
    kind: kinds.EventDeletion,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [],
    content: "deleting posts"
  };

  defaultFilter = [
    {
      ids: [],
      authors: [],
      kinds: [kinds.UserStatuses],
      "#d": ["general"],
      since: Math.floor(new Date().getTime() / 1000) - (60 * 60 * 24),
      until: Math.floor(new Date().getTime() / 1000) + (60 * 60 * 24),
      limit: 500
    }
  ];

  formEventPublish = this.fb.group({
    nsec: [''],
    pubkey: [''],
    event: [this.formatToString(this.templateUserStatuses)]  
  });

  formRelayFilter = this.fb.group({
    filter: [this.formatToString(this.defaultFilter)]
  });

  nostrSecretHide = true;

  constructor(
    private fb: FormBuilder,
    private npool: NostrPool
  ) { }

  getPubkey(nsec: string): string {
    const { data } = nip19.decode(nsec);
    return getPublicKey(data as Uint8Array);
  }

  generateNostrSecret(): void {
    const nsec = nip19.nsecEncode(generateSecretKey());
    this.formEventPublish.patchValue({
      nsec,
      pubkey: this.getPubkey(nsec)
    });
  }

  formatToString(event: object, updateCreationTime = true): string {
    if ('created_at' in event && updateCreationTime) {
      event = {
        ...event,
        created_at: Math.floor(new Date().getTime() / 1000)
      }
    }

    return JSON.stringify(event, null, '  ');
  }

  sign(): void {
    const raw = this.formEventPublish.getRawValue();
    if (raw.nsec && raw.event) {
      const { data } = nip19.decode(raw.nsec);
      const verifiedEvent = finalizeEvent(JSON.parse(raw.event), data as Uint8Array);

      this.formEventPublish.patchValue({
        event: this.formatToString(verifiedEvent, false)
      });
    }
  }

  view(event: Event): void {
    this.formEventPublish.patchValue({
      event: this.formatToString(event)
    });
  }

  react(event: Event): void {
    const template = { ...this.templateReact };
    template.tags.push([ 'e', event.id ]);
    template.tags.push([ 'p', event.pubkey ]);
    template.tags.push([ 'k', String(event.kind) ]);

    this.formEventPublish.patchValue({
      event: this.formatToString(template)
    });
  }

  repost(event: Event): void {
    const template = { ...this.templateRepost };
    template.content = JSON.stringify(event);
    this.formEventPublish.patchValue({
      event: this.formatToString(template)
    });
  }

  delete(event: Event): void {
    const template = { ...this.templateDelete };
    template.tags.push(['e', event.id]);
    this.formEventPublish.patchValue({
      event: this.formatToString(template)
    });
  }

  request(): void {
    const { filter } = this.formRelayFilter.getRawValue();
    
    if (filter) {
      this.npool
        .query(JSON.parse(filter))
        .then(events => this.listedEvents = [ ...this.listedEvents, ...events ]);
    }
  }

  listen(): void {
    const { filter } = this.formRelayFilter.getRawValue();

    if (filter) {
      this.listening = this.npool
        .observe(JSON.parse(filter))
        .subscribe(event => this.listedEvents.push(event));
    }
  }

  publish(): void {
    const { event } = this.formEventPublish.getRawValue();

    if (event) {
      this.npool.event(JSON.parse(event));
    }
  }
}
