import type { COMMON_STRINGS } from "./strings.common";

/** Interpolation variables. `count` also selects the plural variant. */
export interface Vars {
  count?: number;
  [name: string]: string | number | undefined;
}

/** `x_one`/`x_other` are addressed as `x`; the host's i18n does the real CLDR. */
type PluralBase<K> = K extends `${infer B}_other` ? B : never;

/**
 * The keys callable against one English slice, plural variants collapsed.
 *
 * Each surface binds its helpers to its own slice, so `t("editor.tool.arc")`
 * inside src/viewer is a compile error rather than a key rendered raw at runtime.
 */
export type SurfaceKey<S> =
  | Exclude<keyof S & string, `${string}_one` | `${string}_other`>
  | PluralBase<keyof S & string>;

/**
 * A translator over some set of keys.
 *
 * Whatever a host injects must be referentially stable — derived UI is memoized
 * off its identity.
 */
export type TranslateFor<K extends string> = (key: K, vars?: Vars) => string;

/**
 * What the context carries. Accepts any key, because one host translator serves
 * every surface it mounts; each surface narrows it back down through `useT()`.
 */
export type AnyTranslate = TranslateFor<string>;

/** Keys usable from anywhere, whichever surface imports the module. */
export type CommonKey = SurfaceKey<typeof COMMON_STRINGS>;

/**
 * The translator a module imported by more than one surface must ask for.
 * Restricting it to `common.*` is what stops such a module from rendering a key
 * that some importing surface's slice does not carry. Any surface's own `T` is
 * assignable here, since every slice includes the common ones.
 */
export type CommonT = TranslateFor<CommonKey>;
