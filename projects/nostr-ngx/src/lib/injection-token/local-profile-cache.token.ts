import { InjectionToken } from "@angular/core";
import { InMemoryProfileCache } from "../in-memory/in-memory.profile-cache";

export const LOCAL_PROFILE_CACHE_TOKEN = new InjectionToken<InMemoryProfileCache>('InMemoryProfileCache');