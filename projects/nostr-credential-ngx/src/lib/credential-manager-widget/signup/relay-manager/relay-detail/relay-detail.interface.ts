import { IRelayDetailFeeSubscription } from "./relay-detail-fee-subscription.interface";
import { IRelayDetailLimitation } from "./relay-detail-limitation.interface";

export interface IRelayDetail {
  contact: string;
  description: string;
  name: string;
  pubkey: string;
  software: string;
  supported_nips: number[];
  version: string;

  icon?: string;
  limitation?: IRelayDetailLimitation;
  payments_url?: string;
  fees?: {
    admission?: IRelayDetailFeeSubscription[];
    subscription?: IRelayDetailFeeSubscription[];
  }
}
