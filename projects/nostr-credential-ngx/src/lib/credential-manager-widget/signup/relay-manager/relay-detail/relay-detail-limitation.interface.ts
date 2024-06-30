/**
 * These are limitations imposed by the relay on clients. Your client should expect that
 * requests which exceed these practical limitations are rejected or fail immediately.
 */
export interface IRelayDetailLimitation {

  /**
   * payment_required: this relay requires payment before a new connection may perform any action.
   */
  payment_required: boolean;

  /**
   * max_message_length: this is the maximum number of bytes for incoming JSON that the relay will
   * attempt to decode and act upon. When you send large subscriptions, you will be limited by this
   * value. It also effectively limits the maximum size of any event. Value is calculated from [ to ]
   * and is after UTF-8 serialization (so some unicode characters will cost 2-3 bytes). It is equal
   * to the maximum size of the WebSocket message frame.
   */
  max_message_length: number;

  /**
   * max_event_tags: in any event, this is the maximum number of elements in the tags list.
   */
  max_event_tags: number;

  /**
   * max_subscriptions: total number of subscriptions that may be active on a single websocket
   * connection to this relay. It's possible that authenticated clients with a (paid) relationship
   * to the relay may have higher limits.
   */
  max_subscriptions: number;

  /**
   * max_filters: maximum number of filter values in each subscription. Must be one or higher.
   */
  max_filters?: number;

  /**
   * auth_required: this relay requires NIP-42 authentication to happen before a new connection may
   * perform any other action. Even if set to False, authentication may be required for specific actions.
   */
  auth_required: boolean;

  /**
   * max_content_length: maximum number of characters in the content field of any event. This is
   * a count of unicode characters. After serializing into JSON it may be larger (in bytes), and
   * is still subject to the max_message_length, if defined.
   */
  max_content_length?: number;

  /**
   * created_at_lower_limit: 'created_at' lower limit
   */
  created_at_lower_limit?: number;

  /**
   * created_at_upper_limit: 'created_at' upper limit
   */
  created_at_upper_limit?: number;

  /**
   * max_limit: the relay server will clamp each filter's limit value to this number. This means
   * the client won't be able to get more than this number of events from a single subscription
   * filter. This clamping is typically done silently by the relay, but with this number, you can
   * know that there are additional results if you narrowed your filter's time range or other parameters.
   */
  max_limit?: number;

  /**
   * max_subid_length: maximum length of subscription id as a string.
   */
  max_subid_length?: number;

  /**
   * min_pow_difficulty: new events will require at least this difficulty of PoW, based on NIP-13,
   * or they will be rejected by this server.
   */
  min_pow_difficulty?: number;

  /**
   * restricted_writes: this relay requires some kind of condition to be fulfilled in order to
   * accept events (not necessarily, but including payment_required and min_pow_difficulty).
   * This should only be set to true when users are expected to know the relay policy before
   * trying to write to it -- like belonging to a special pubkey-based whitelist or writing only
   * events of a specific niche kind or content. Normal anti-spam heuristics, for example, do
   * not qualify.
   */
  restricted_writes?: true;
}
