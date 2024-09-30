import { NostrConfig } from './nostr-config.interface';

// TODO: config must be updated by path, they must not be all override by a partial object
// just copied njump relay config
export const nostrConfig: Required<NostrConfig> = {
  defaultProfile: {
    //  FIXME: colcoar uma imagem pequena
    banner: '',
    //  FIXME: será que coloco aquele robozinho bacana ou só coloco uma imagem leve?
    picture: '',
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
  searchFallback: [
    "wss://nostr.wine",
    "wss://relay.nostr.band",
    "wss://relay.noswhere.com",
  ],
  bestFor: {
    findJustById: [
      "wss://cache2.primal.net/v1",
			"wss://relay.noswhere.com",
			"wss://relay.damus.io",
    ],
    findProfileConfig: [
      "wss://purplepag.es",
      "wss://user.kindpag.es",
      "wss://relay.nos.social"
    ]
  }
};