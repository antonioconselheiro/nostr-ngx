import { Injectable } from "@angular/core";
import { Reaction, Repost, ShortTextNote, Zap } from 'nostr-tools/kinds';
import { NostrEventViewModel } from "../domain/view-model/nostr-event.view-model";
import { LazyNoteViewModel } from "../domain/view-model/lazy-note.view-model";
import { ReactionViewModel } from "../domain/view-model/reaction.view-model";
import { ZapViewModel } from "../domain/view-model/zap.view-model";
import { RepostNoteViewModel } from "../domain/view-model/repost-note.view-model";
import { EagerNoteViewModel } from "../domain/view-model/eager-note.view-model";
import { NoteViewModel } from "../domain/view-model/note.view-model";

/**
 * Allow identify which type of view model is implemented
 */
@Injectable({
  providedIn: 'root'
})
export class ViewModelGuard {
  static isReactionViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is ReactionViewModel {
    return viewModel?.event?.kind === Reaction;
  }

  static isZapViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is ZapViewModel {
    return viewModel?.event?.kind === Zap;
  }

  static isRepostNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is RepostNoteViewModel {
    return viewModel?.event?.kind === Repost;
  }

  static isEagerNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is EagerNoteViewModel {
    return this.isNoteViewModel(viewModel) && viewModel?.author?.state !== 'raw';
  }

  static isNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is NoteViewModel {
    if (viewModel?.event?.kind) {
      return [Repost, ShortTextNote].includes(viewModel.event.kind);
    }

    return false;
  }

  static isLazyNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is LazyNoteViewModel {
    return this.isNoteViewModel(viewModel) && viewModel?.author?.state === 'raw';
  }

  isReactionViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is ReactionViewModel {
    return ViewModelGuard.isReactionViewModel(viewModel);
  }

  isZapViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is ZapViewModel {
    return ViewModelGuard.isZapViewModel(viewModel);
  }

  isRepostNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is RepostNoteViewModel {
    return ViewModelGuard.isRepostNoteViewModel(viewModel);
  }

  isEagerNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is EagerNoteViewModel {
    return ViewModelGuard.isEagerNoteViewModel(viewModel);
  }

  isNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is NoteViewModel {
    return ViewModelGuard.isNoteViewModel(viewModel);
  }

  isLazyNoteViewModel(viewModel: NostrEventViewModel | LazyNoteViewModel): viewModel is LazyNoteViewModel {
    return ViewModelGuard.isLazyNoteViewModel(viewModel);
  }
}
