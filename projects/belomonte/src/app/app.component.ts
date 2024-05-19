import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalizeEvent, generateSecretKey, nip19, Event, UnsignedEvent, NostrEvent, EventTemplate } from 'nostr-tools';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  listedEvents: Array<NostrEvent> = [];

  templateMetadata: EventTemplate = {
    kind: 0,
    created_at: Math.floor(new Date().getTime() / 1000),
    content: "{\"name\":\"António Vicente\"}",
    tags: []
  };

  templateText: EventTemplate = {
    kind: 1,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [
      ["t", "hashtag"]
    ],
    content: "#hashtag"
  };

  templateUserStatuses: EventTemplate = {
    kind: 30315,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [
      ["d", "general"],
      ["t", "hashtag"]
    ],
    content: "my status #hashtag"
  };

  templateReact: EventTemplate = {
    kind: 7,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [],
    content: "+"
  };

  templateRepost: EventTemplate = {
    kind: 6,
    created_at: Math.floor(new Date().getTime() / 1000),
    content: "#hashtag",
    tags: []
  };

  templateDelete: EventTemplate = {
    kind: 5,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [],
    content: "deleting posts"
  };

  defaultFilter = {
    ids: [],
    authors: [],
    kinds: [30315],
    "#d": ["general"],
    since: Math.floor(new Date().getTime() / 1000) - (60 * 60 * 24),
    until: Math.floor(new Date().getTime() / 1000) + (60 * 60 * 24),
    limit: 500
  };

  formEventPublish = this.fb.group({
    nsec: [''],
    event: [this.formatToString(this.templateUserStatuses)]  
  });

  formRelayFilter = this.fb.group({
    filter: [this.formatToString(this.defaultFilter)],
  });

  nostrSecretHide = true;

  constructor(
    private fb: FormBuilder
  ) { }

  generateNostrSecret(): void {
    this.formEventPublish.patchValue({
      nsec: nip19.nsecEncode(generateSecretKey())
    });
  }

  formatToString(event: object): string {
    return JSON.stringify(event, null, '  ');
  }

  sign(): void {
    const raw = this.formEventPublish.getRawValue();
    if (raw.nsec && raw.event) {
      const { data } = nip19.decode(raw.nsec);
      const verifiedEvent = finalizeEvent(JSON.parse(raw.event), data as Uint8Array);

      this.formEventPublish.patchValue({
        event: this.formatToString(verifiedEvent)
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
}
