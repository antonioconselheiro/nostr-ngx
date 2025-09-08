import { Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';
import { Zap } from 'nostr-tools/kinds';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrViewModelSet } from '../domain/view-model/nostr-view-model.set';
import { ZapViewModel } from '../domain/view-model/zap.view-model';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { ProfileProxy } from '../profile/profile.proxy';
import { SingleViewModelMapper } from './single-view-model.mapper';
import { TagHelper } from './tag.helper';

@Injectable({
  providedIn: 'root'
})
export class ZapMapper implements SingleViewModelMapper<ZapViewModel> {

  constructor(
    private tagHelper: TagHelper,
    private profileProxy: ProfileProxy,
    private guard: NostrGuard
  ) { }

  toViewModel(event: NostrEventWithRelays): ZapViewModel | null;
  toViewModel(event: NostrEventWithRelays<Zap>): ZapViewModel;
  toViewModel(event: Array<NostrEventWithRelays>): NostrViewModelSet<ZapViewModel>;
  toViewModel(event: NostrEventWithRelays | Array<NostrEventWithRelays>): ZapViewModel | NostrViewModelSet<ZapViewModel> | null;
  toViewModel(event: NostrEventWithRelays | Array<NostrEventWithRelays>): ZapViewModel | NostrViewModelSet<ZapViewModel> | null {
    if (event instanceof Array) {
      return this.toViewModelCollection(event);
    } else if (this.guard.isWithRelaysKind(event, Zap)) {
      return this.toSingleViewModel(event);
    }

    return null;
  }

  private toSingleViewModel(withRelays: NostrEventWithRelays<Zap>): ZapViewModel {
    const { event, relays } = withRelays;
    const reactedTo = this.tagHelper.listIdsFromTag('e', event);

    // TODO: validate zap data
    const amountZapped = this.tagHelper.getTagValueByType('amount', event);
    const author = this.profileProxy.getRawAccount(event.pubkey);
    const note = nip19.noteEncode(event.id);
    const nevent = nip19.neventEncode({
      id: event.id,
      author: event.pubkey,
      kind: event.kind,
      relays
    });

    return {
      id: event.id,
      nevent,
      note,
      event,
      content: event.content,
      reactedTo,
      author,
      origin: relays,
      relates: this.tagHelper.getRelatedEvents(event).map(([hex]) => hex),
      amount: amountZapped ? Number(amountZapped) : null,
      createdAt: event.created_at
    };
  }

  private toViewModelCollection(events: Array<NostrEventWithRelays>): NostrViewModelSet<ZapViewModel> {
    const zapSet = new NostrViewModelSet<ZapViewModel>();

    for (const event of events) {
      if (this.guard.isWithRelaysKind(event, Zap)) {
        const viewModel = this.toSingleViewModel(event);
        zapSet.add(viewModel);
      }
    }

    return zapSet;
  }
}
