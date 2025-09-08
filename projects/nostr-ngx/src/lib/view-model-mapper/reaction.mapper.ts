import { Injectable } from '@angular/core';
import { nip19 } from 'nostr-tools';
import { Reaction } from 'nostr-tools/kinds';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { NostrViewModelSet } from '../domain/view-model/nostr-view-model.set';
import { ReactionViewModel } from '../domain/view-model/reaction.view-model';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { ProfileProxy } from '../profile/profile.proxy';
import { TagHelper } from './tag.helper';
import { ViewModelMapper } from './view-model.mapper';

@Injectable({
  providedIn: 'root'
})
export class ReactionMapper implements ViewModelMapper<ReactionViewModel, Record<string, NostrViewModelSet<ReactionViewModel>>> {

  constructor(
    private tagHelper: TagHelper,
    private profileProxy: ProfileProxy,
    private guard: NostrGuard
  ) { }

  toViewModel(event: NostrEventWithRelays): ReactionViewModel | null;
  toViewModel(event: NostrEventWithRelays<Reaction>): ReactionViewModel;
  toViewModel(events: Array<NostrEventWithRelays>): Record<string, NostrViewModelSet<ReactionViewModel>>;
  toViewModel(event: NostrEventWithRelays | Array<NostrEventWithRelays>): ReactionViewModel | Record<string, NostrViewModelSet<ReactionViewModel>> | null {
    if (event instanceof Array) {
      return this.toViewModelCollection(event);
    } else if (this.guard.isWithRelaysKind(event, Reaction)) {
      return this.toSingleViewModel(event);
    }

    return null;
  }

  private toSingleViewModel(withRelays: NostrEventWithRelays<Reaction>): ReactionViewModel {
    const { event, relays } = withRelays;
    const reactedTo = this.tagHelper.listIdsFromTag('e', event);
    const relates = this.tagHelper.getRelatedEvents(event).map(([event]) => event)
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
      note,
      nevent,
      content: event.content,
      reactedTo,
      event,
      author,
      origin: relays,
      relates,
      createdAt: event.created_at
    };
  }

  private toViewModelCollection(withRelaysList: Array<NostrEventWithRelays>): Record<string, NostrViewModelSet<ReactionViewModel>> {
    const reactionRecord: Record<string, NostrViewModelSet<ReactionViewModel>> = {};

    for (const withRelays of withRelaysList) {
      if (this.guard.isWithRelaysKind(withRelays, Reaction)) {
        const sortedSet = reactionRecord[withRelays.event.content] || new NostrViewModelSet<ReactionViewModel>();
        const viewModel = this.toSingleViewModel(withRelays);
        sortedSet.add(viewModel);
      }
    }

    return reactionRecord;
  }
}
