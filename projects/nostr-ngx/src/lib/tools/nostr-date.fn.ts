export function nostrDate(jsTimestamp: number = new Date().getTime()): number {
  return Math.floor(jsTimestamp / 1000);
}
