import { InjectionToken } from '@angular/core';
import { NCache } from '@nostrify/nostrify';

//  AHHH!! IN MEEMORY
export const IN_MEMORY_NCACHE_TOKEN = new InjectionToken<NCache>('MainNCache');