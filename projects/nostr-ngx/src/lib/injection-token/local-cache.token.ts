import { InjectionToken } from '@angular/core';
import { InMemoryNCache } from './in-memory.ncache';

export const LOCAL_CACHE_TOKEN = new InjectionToken<InMemoryNCache>('InMemoryNCache');