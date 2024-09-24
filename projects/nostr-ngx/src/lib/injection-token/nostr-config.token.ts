import { InjectionToken } from "@angular/core";
import { NostrConfig } from "../configs/nostr-config.interface";

export const NOSTR_CONFIG_TOKEN = new InjectionToken<NostrConfig>('NostrConfig');