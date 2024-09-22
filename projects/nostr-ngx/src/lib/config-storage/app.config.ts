import { RelayRecord } from 'nostr-tools/relay';

export const appConfig: {
  defaultProfile: {
    picture: string;
    banner: string;
  };
  defaultFallback: RelayRecord;
} = {
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