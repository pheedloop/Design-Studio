import type { COMMON } from "./strings";

/** Interpolation variables. `count` also selects the plural variant. */
export interface Vars {
  count?: number;
  [name: string]: string | number | undefined;
}

type PluralBase<K> = K extends `${infer B}_other` ? B : never;

/** One slice's callable keys — `x_one`/`x_other` collapse to `x`. */
export type SurfaceKey<S> =
  | Exclude<keyof S & string, `${string}_one` | `${string}_other`>
  | PluralBase<keyof S & string>;

/** `{ editor: { "menu.copy": … } }` → `{ "editor.menu.copy": … }`. */
export type Flattened<G> = {
  [N in keyof G & string as `${N}.${keyof G[N] & string}`]: string;
};

/** Must be referentially stable — derived UI is memoized off its identity. */
export type TranslateFor<K extends string> = (key: K, vars?: Vars) => string;

/** `TranslateFor` plus the target locale, for when the result is a lookup key. */
export type ResolveEnglishFor<K extends string> = (
  key: K,
  vars?: Vars,
  locale?: string,
) => string;

/** What the context carries: one host translator serves every surface it mounts. */
export type AnyTranslate = TranslateFor<string>;

export type CommonKey = SurfaceKey<Flattened<{ common: typeof COMMON }>>;

/** For modules imported by more than one surface: `common.*` keys only. */
export type CommonT = TranslateFor<CommonKey>;
