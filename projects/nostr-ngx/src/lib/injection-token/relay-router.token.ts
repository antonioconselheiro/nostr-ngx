import { InjectionToken } from '@angular/core';
import { RouterMatcher } from '../pool/router-matcher.interface';

export const RELAY_ROUTER_TOKEN = new InjectionToken<RouterMatcher>('RelayRouter');