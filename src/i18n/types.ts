// ---------------------------------------------------------------------------
// The injected-translator contract
// ---------------------------------------------------------------------------
//
// Design Studio owns NO i18n runtime — no i18next, no react-i18next, no locale
// files beyond its own English manifest. It owns a manifest of (stableKey →
// English) and the `Translate` function shape below. The host app resolves.
//
// This exists because the two host apps translate in near-opposite ways and the
// library cannot adopt either convention:
//
//   ditto        i18next with structured dotted keys and a build-time catalog.
//                Namespaces DS keys as `designStudio.<key>`.
//
//   Charmander   i18next with `keySeparator: false, nsSeparator: false`, so the
//                ENGLISH STRING IS THE LOOKUP KEY — plus per-event user-generated
//                (UGC) translations fetched at runtime. It therefore cannot be
//                handed a fixed catalog; it maps DS key → English → UGC entry.
//
// Both index the manifest their entry point exports (`designStudioStrings`).
// Passing no translator at all renders the built-in English, which is why every
// manifest value is guaranteed non-empty.

import type { StringKey } from "./strings";

/**
 * Interpolation variables for a string's `{{placeholders}}`.
 *
 * `count` is special: it additionally selects the English plural variant
 * (`key_one` / `key_other`) before the host ever sees the string.
 */
export interface Vars {
  count?: number;
  [name: string]: string | number | undefined;
}

/**
 * The translator a host injects via the `translate` prop.
 *
 * Receives DS's stable key and the interpolation variables; returns a
 * display-ready string. MUST be referentially stable across renders — wrap it in
 * `useCallback`/`useMemo` keyed on the host's language and catalog. DS memoizes
 * derived UI off this identity, so a fresh function every render re-derives menus
 * and tool lists on every keystroke in the editor.
 */
export type Translate = (key: StringKey, opts?: Vars) => string;

/** What `useT()` hands back to components. Same shape, narrower name. */
export type T = (key: StringKey, vars?: Vars) => string;

/**
 * Catalog lookup for `createTranslate`.
 *
 * Receives the UNINTERPOLATED English template — the form a UGC catalog is keyed
 * by — and the DS key, for hosts that would rather key on that. Return a
 * translated template with its `{{placeholders}}` still intact, or undefined to
 * fall back to English. DS interpolates afterwards; see createTranslate.
 */
export type Lookup = (english: string, key: StringKey) => string | undefined;
