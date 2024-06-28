import { IRelayDetailFee } from "./relay-detail-fee.interface";
import { IRelayDetailLimitation } from "./relay-detail-limitation.interface";

/**
 * NIP-11 resultset interface
 * https://github.com/nostr-protocol/nips/blob/master/11.md
 */
export interface IRelayDetail {
  /**
   * A relay may select a name for use in client software. This is a string, and SHOULD be less than 30 characters to avoid client truncation.
   */
  name: string;

  /**
   * Detailed plain-text information about the relay may be contained in the description string. It is recommended that this contain no markup, formatting or line breaks for word wrapping, and simply use double newline characters to separate paragraphs. There are no limitations on length.
   */
  description: string;

  /**
   * An alternative contact may be listed under the contact field as well, with the same purpose as pubkey. Use of a Nostr public key and direct message SHOULD be preferred over this. Contents of this field SHOULD be a URI, using schemes such as mailto or https to provide users with a means of contact.
   */
  contact: string;

  /**
   * An administrative contact may be listed with a pubkey, in the same format as Nostr events (32-byte hex for a secp256k1 public key). If a contact is listed, this provides clients with a recommended address to send encrypted direct messages (See NIP-17) to a system administrator. Expected uses of this address are to report abuse or illegal content, file bug reports, or request other technical assistance.
   *
   * Relay operators have no obligation to respond to direct messages.
   */
  pubkey: string;

  /**
   * The relay server implementation MAY be provided in the software attribute. If present, this MUST be a URL to the project's homepage.
   */
  software: string;

  /**
   * As the Nostr protocol evolves, some functionality may only be available by relays that implement a specific NIP. This field is an array of the integer identifiers of NIPs that are implemented in the relay. Examples would include 1, for "NIP-01" and 9, for "NIP-09". Client-side NIPs SHOULD NOT be advertised, and can be ignored by clients.
   */
  supported_nips: number[];

  /**
   * The relay MAY choose to publish its software version as a string attribute. The string format is defined by the relay implementation. It is recommended this be a version number or commit identifier.
   */
  version: string;

  /**
   * A URL pointing to an image to be used as an icon for the relay. Recommended to be squared in shape.
   */
  icon?: string;
  limitation?: IRelayDetailLimitation;
  payments_url?: string;
  fees?: {
    admission?: IRelayDetailFee[];
    subscription?: Array<(IRelayDetailFee & { period: number })>;
    publication?: Array<(IRelayDetailFee & { kinds: number[] })>;
  }
}
