import type { StringKey } from "./strings";

/** Interpolation variables. `count` also selects the plural variant. */
export interface Vars {
  count?: number;
  [name: string]: string | number | undefined;
}

/**
 * The translator a host injects via the `translate` prop. Must be referentially
 * stable — derived UI is memoized off its identity.
 */
export type Translate = (key: StringKey, opts?: Vars) => string;

/** What `useT()` returns. */
export type T = (key: StringKey, vars?: Vars) => string;
