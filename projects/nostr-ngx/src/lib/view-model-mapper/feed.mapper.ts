import { Injectable } from '@angular/core';
import { Reaction, Repost, ShortTextNote, Zap } from 'nostr-tools/kinds';
import { NostrEventWithRelays } from '../domain/event/nostr-event-with-relays.interface';
import { EagerNoteViewModel } from '../domain/view-model/eager-note.view-model';
import { FeedViewModel } from '../domain/view-model/feed.view-model';
import { NoteViewModel } from '../domain/view-model/note.view-model';
import { ReactionViewModel } from '../domain/view-model/reaction.view-model';
import { RepostNoteViewModel } from '../domain/view-model/repost-note.view-model';
import { NostrGuard } from '../nostr-utils/nostr.guard';
import { ReactionMapper } from './reaction.mapper';
import { RepostMapper } from './repost.mapper';
import { SimpleTextMapper } from './simple-text.mapper';
import { ViewModelPatch } from './view-model-patch.mapper';
import { ViewModelMapper } from './view-model.mapper';
import { ZapMapper } from './zap.mapper';

@Injectable({
  providedIn: 'root'
})
export class FeedMapper implements ViewModelMapper<NoteViewModel, FeedViewModel>, ViewModelPatch<FeedViewModel> {

  constructor(
    private guard: NostrGuard,
    private repostMapper: RepostMapper,
    private simpleTextMapper: SimpleTextMapper,
    private reactionMapper: ReactionMapper,
    private zapMapper: ZapMapper
  ) { }

  toViewModel(withRelays: Array<NostrEventWithRelays>): FeedViewModel;
  toViewModel(withRelays: NostrEventWithRelays<ShortTextNote>): NoteViewModel;
  toViewModel(withRelays: NostrEventWithRelays<Repost>): RepostNoteViewModel;
  toViewModel(withRelays: NostrEventWithRelays): NoteViewModel | null;
  toViewModel(withRelays: NostrEventWithRelays | Array<NostrEventWithRelays>): NoteViewModel | FeedViewModel | null {
    if (withRelays instanceof Array) {
      return this.toViewModelCollection(withRelays);
    } else if (this.guard.isWithRelaysKind(withRelays, ShortTextNote)) {
      return this.simpleTextMapper.toViewModel(withRelays);
    } else if (this.guard.isWithRelaysKind(withRelays, Repost)) {
      return this.repostMapper.toViewModel(withRelays);
    }

    return null;
  }

  private toViewModelCollection(withRelayList: Array<NostrEventWithRelays>, feed = new FeedViewModel(), indexOnly = false): FeedViewModel {
    for (const withRelay of withRelayList) {
      let viewModel: EagerNoteViewModel | ReactionViewModel | null = null;
      if (this.guard.isWithRelaysKind(withRelay, Repost) || this.guard.isSerializedNostrEvent(withRelay.event.content)) {
        viewModel = this.repostMapper.toViewModel(withRelay);
      } else if (this.guard.isWithRelaysKind(withRelay, ShortTextNote)) {
        viewModel = this.simpleTextMapper.toViewModel(withRelay);
      } else if (this.guard.isWithRelaysKind(withRelay, Reaction)) {
        viewModel = this.reactionMapper.toViewModel(withRelay);
      } else if (this.guard.isWithRelaysKind(withRelay, Zap)) {
        viewModel = this.zapMapper.toViewModel(withRelay);
      }

      if (viewModel) {
        if (indexOnly) { // will only index, do not add
          feed.index(viewModel);
        } else {
          feed.add(viewModel);
        }
      }
    }

    return feed;
  }

  patchViewModel(feed: FeedViewModel, events: Array<NostrEventWithRelays>): FeedViewModel {
    return this.toViewModelCollection(events, feed);
  }

  indexViewModel(feed: FeedViewModel, events: Array<NostrEventWithRelays>): FeedViewModel {
    return this.toViewModelCollection(events, feed, true);
  }
}
