export type Base64String = `data:${string};base64,${string}`;
export function Base64String(base64: unknown): Base64String {
  return String(base64) as Base64String;
}
