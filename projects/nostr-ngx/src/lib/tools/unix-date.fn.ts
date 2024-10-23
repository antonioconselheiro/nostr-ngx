export function unixDate(millisecoundTimestamp: number = new Date().getTime()): number {
  return Math.floor(millisecoundTimestamp / 1000);
}
