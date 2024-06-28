export interface IRelayDetailLimitation {
  payment_required: boolean;
  max_message_length: number;
  max_event_tags: number;
  max_subscriptions: number;
  auth_required: boolean;

  created_at_lower_limit?: number;
  created_at_upper_limit?: number;
  max_limit?: number;
  max_subid_length?: number;
  min_pow_difficulty?: number;
  restricted_writes?: true;
}
