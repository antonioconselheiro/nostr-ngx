import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MainPool, NostrEventKind, NostrService, SmartPool } from '@belomonte/nostr-ngx';
import { Event, EventTemplate, finalizeEvent, generateSecretKey, getPublicKey, nip19, NostrEvent } from 'nostr-tools';
import { Subscription } from 'rxjs';
import { globalPoolsStatefull } from '../../global-pools.statefull';

@Component({
  selector: 'app-pool-interact',
  templateUrl: './pool-interact.component.html',
  styleUrl: './pool-interact.component.scss'
})
export class PoolInteractComponent implements OnInit {

  poolRecord: Record<string, SmartPool> = { 'main pool': this.pool, ...globalPoolsStatefull };
  poolsOptions = ['main pool'].concat(Object.keys(globalPoolsStatefull));
  choosenPool = 'main pool';

  listening: Subscription | null = null;
  listedEvents: Array<NostrEvent> = [];

  templateMetadata: EventTemplate = {
    kind: NostrEventKind.Metadata,
    created_at: Math.floor(new Date().getTime() / 1000),
    content: "{\"name\":\"António Vicente\"}",
    tags: []
  };

  templateText: EventTemplate = {
    kind: NostrEventKind.ShortTextNote,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [
      ["t", "hashtag"]
    ],
    content: "#hashtag"
  };

  templateUserStatuses: EventTemplate = {
    kind: NostrEventKind.UserStatuses,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [
      ["d", "general"],
      ["t", "hashtag"]
    ],
    content: "my status #hashtag"
  };

  templateReact: EventTemplate = {
    kind: NostrEventKind.Reaction,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [],
    content: "+"
  };

  templateRepost: EventTemplate = {
    kind: NostrEventKind.Repost,
    created_at: Math.floor(new Date().getTime() / 1000),
    content: "#hashtag",
    tags: []
  };

  templateDelete: EventTemplate = {
    kind: NostrEventKind.EventDeletion,
    created_at: Math.floor(new Date().getTime() / 1000),
    tags: [],
    content: "deleting posts"
  };

  defaultFilter = [
    {
      ids: [],
      authors: [],
      kinds: [NostrEventKind.UserStatuses],
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

  pools: Record<string, SmartPool> = {};

  constructor(
    private fb: FormBuilder,
    private pool: MainPool,
    private nostrService: NostrService
  ) { }

  ngOnInit(): void {
    this.pools = {
      'main pool': this.pool,
      ...globalPoolsStatefull
    }
  }

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

      this.nostrService
        .request(JSON.parse(filter), this.poolRecord[this.choosenPool])
        .then(events => this.listedEvents = [ ...this.listedEvents, ...events ]);
    }
  }

  listen(): void {
    const { filter } = this.formRelayFilter.getRawValue();
    if (filter) {
      this.listening = this.nostrService
        .observable(JSON.parse(filter), this.poolRecord[this.choosenPool])
        .subscribe(event => this.listedEvents.push(event));
    }
  }

  publish(): void {
    const { event } = this.formEventPublish.getRawValue();
    if (event) {
      this.nostrService.publish(JSON.parse(event), this.poolRecord[this.choosenPool]);
    }
  }
}
