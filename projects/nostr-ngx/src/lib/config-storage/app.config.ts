import { NostrConfig } from '../configs/nostr-config.interface';

export const appConfig: NostrConfig = {
  defaultProfile: {
    picture: '',
    banner: ''
  },
  defaultFallback: {
    'wss://nos.lol': {
      read: true, write: true
    },
    'wss://nostr.mom': {
      read: true, write: true
    }
  }
};