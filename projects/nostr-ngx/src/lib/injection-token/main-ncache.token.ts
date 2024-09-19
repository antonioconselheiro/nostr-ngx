import { InjectionToken } from '@angular/core';
import { NCache } from '@nostrify/nostrify';

export const MAIN_NCACHE_TOKEN = new InjectionToken<NCache>('MainNCache');