import { NostrConfig } from '../configs/nostr-config.interface';

// TODO: config must be updated by path, they must not be all override by a partial object
// just copied njump relay config
export const nostrConfig: NostrConfig = {
  defaultProfile: {
    picture: '',
    banner: ''
  },
  defaultFallback: {
    'wss://nos.lol': {
      read: true, write: true
    },
    'wss://nostr.mom': {
      read: true, write: false
    },
    'wss://offchain.pub': {
      read: true, write: false
    }
  },
  bestFor: {
    findJustById: [
      "wss://cache2.primal.net/v1",
			"wss://relay.noswhere.com",
			"wss://relay.damus.io",
    ],
    getProfileConfig: [
      "wss://purplepag.es",
      "wss://user.kindpag.es",
      "wss://relay.nos.social"
    ],
    searchProfiles: [
      "wss://nostr.wine",
			"wss://relay.nostr.band",
			"wss://relay.noswhere.com",
    ],
    searchNotes: [
      "wss://nostr.wine",
			"wss://relay.nostr.band",
			"wss://relay.noswhere.com"
    ]
  }
};