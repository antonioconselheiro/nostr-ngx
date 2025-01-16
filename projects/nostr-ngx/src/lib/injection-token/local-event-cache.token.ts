import { InjectionToken } from '@angular/core';
import { InMemoryEventCache } from '../in-memory/in-memory.event-cache';

export const LOCAL_EVENT_CACHE_TOKEN = new InjectionToken<InMemoryEventCache>('InMemoryEventCache');