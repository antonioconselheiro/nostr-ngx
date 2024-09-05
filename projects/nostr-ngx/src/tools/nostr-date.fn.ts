export function nostrDate(jsTimestamp: number): number {
  return Math.floor(jsTimestamp / 1000);
}
