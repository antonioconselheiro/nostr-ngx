import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountViewModelProxy } from './account-view-model.proxy';
import { NoteContentMapper } from './note-content.mapper';
import { ReactionMapper } from './reaction.mapper';
import { RepostMapper } from './repost.mapper';
import { SimpleTextMapper } from './simple-text.mapper';
import { TagHelper } from './tag.helper';
import { ViewModelGuard } from './view-model.guard';
import { ZapMapper } from './zap.mapper';
import { ProfileModule } from '../profile/profile.module';

@NgModule({
  imports: [
    CommonModule,
    ProfileModule
  ],
  providers: [
    AccountViewModelProxy,
    SimpleTextMapper,
    RepostMapper,
    ReactionMapper,
    ZapMapper,
    TagHelper,
    NoteContentMapper,
    ViewModelGuard
  ]
})
export class ViewModelMapperModule { }
