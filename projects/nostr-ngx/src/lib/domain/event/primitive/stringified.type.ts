/**
 * @draft
 * This type represent a stringifiied type.
 * Maybe I not use that really, but maybe I choose to compose a
 * deep library just for that, but for that I need this issue done:
 * https://github.com/microsoft/TypeScript/issues/41160
 */
export type Stringified<T> =
  T extends string ? `"${string}"` :
  T extends number ? `${number}` :
  T extends Array<infer Type> ? `[${Stringified<Type>}]` :
  T extends object ? `{${string}}` :
  T extends boolean ? 'true' | 'false' :
  T extends null ? 'null' :
  T extends undefined ? 'undefined' :
  never;
