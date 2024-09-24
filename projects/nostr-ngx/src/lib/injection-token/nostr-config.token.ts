import { InjectionToken } from "@angular/core";
import { AppConfig } from "../configs/app-config.interface";

export const NOSTR_CONFIG_TOKEN = new InjectionToken<AppConfig>('NostrConfig');