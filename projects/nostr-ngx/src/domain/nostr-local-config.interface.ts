export interface INostrLocalConfig {
  relayFrom: 'none' | 'localStorage' | 'signer' | 'public';
  relays?: string[];
}