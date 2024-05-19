import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Event, EventTemplate, finalizeEvent, generateSecretKey, nip19, NostrEvent } from 'nostr-tools';
import { NostrModule, NostrService } from '@belomonte/nostr-ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NostrModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  listening: Subscription | null = null;

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

  defaultFilter = [
    {
      ids: [],
      authors: [],
      kinds: [30315],
      "#d": ["general"],
      since: Math.floor(new Date().getTime() / 1000) - (60 * 60 * 24),
      until: Math.floor(new Date().getTime() / 1000) + (60 * 60 * 24),
      limit: 500
    }
  ];

  formEventPublish = this.fb.group({
    nsec: [''],
    event: [this.formatToString(this.templateUserStatuses)]  
  });

  formRelayFilter = this.fb.group({
    filter: [this.formatToString(this.defaultFilter)],
  });

  nostrSecretHide = true;

  constructor(
    private fb: FormBuilder,
    private nostrService: NostrService
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

  request(): void {
    const { filter } = this.formRelayFilter.getRawValue();
    if (filter) {
      this.nostrService
        .request(JSON.parse(filter), [ 'ws://umbrel.local:4848' ])
        .then(events => this.listedEvents = [ ...this.listedEvents, ...events ]);
    }
  }

  listen(): void {
    const { filter } = this.formRelayFilter.getRawValue();
    if (filter) {
      this.listening = this.nostrService
        .subscribe(JSON.parse(filter), [ 'ws://umbrel.local:4848' ])
        .subscribe(event => this.listedEvents.push(event));
    }
  }

  publish(): void {
    const { event } = this.formEventPublish.getRawValue();
    if (event) {
      this.nostrService.publish(JSON.parse(event), [ 'ws://umbrel.local:4848' ]);
    }
  }
}
