import { InjectionToken } from '@angular/core';
import { NStore } from '@nostrify/nostrify';

//  no need to shout
export const IO_CACHE_NSTORE_TOKEN = new InjectionToken<NStore>('MainNStore');