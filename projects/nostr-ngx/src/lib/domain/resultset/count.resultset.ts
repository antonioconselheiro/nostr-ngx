
/** NIP-45 `COUNT`, used to send counts requested by clients. */
export type CountResultset = ['COUNT', subscriptionId: string, { count: number; approximate?: boolean }];
