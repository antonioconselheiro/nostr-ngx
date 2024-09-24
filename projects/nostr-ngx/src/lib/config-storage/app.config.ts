import { AppConfig } from '../configs/app-config.interface';

export const appConfig: AppConfig = {
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