import { Injectable } from '@angular/core';
import { FeedViewModel } from '../domain/view-model/feed.view-model';
import { AccountGuard } from '../profile/account.guard';
import { ProfileProxy } from '../profile/profile.proxy';

@Injectable({
  providedIn: 'root'
})
export class AccountViewModelProxy {

  constructor(
    private accountGuard: AccountGuard,
    private profileProxy: ProfileProxy
  ) { }

  async loadViewModelAccounts(feed: FeedViewModel): Promise<void> {
    for await (const related of feed) {
      if (!this.accountGuard.isRenderableGroup(related.viewModel.author)) {
        if (related.viewModel.author) {
          await this.profileProxy.loadAccount(related.viewModel.author.pubkey, 'essential');
        }
      }
    }
  }
}
