const ACCENTS: Record<string, string> = {
  a: "á",
  b: "ƀ",
  c: "ç",
  d: "ð",
  e: "é",
  f: "ƒ",
  g: "ğ",
  h: "ĥ",
  i: "í",
  j: "ĵ",
  k: "ķ",
  l: "ł",
  m: "ɱ",
  n: "ñ",
  o: "ó",
  p: "ƥ",
  q: "ɋ",
  r: "ŕ",
  s: "ş",
  t: "ţ",
  u: "ú",
  v: "ṽ",
  w: "ŵ",
  x: "ẋ",
  y: "ý",
  z: "ż",
  A: "Á",
  B: "Ɓ",
  C: "Ç",
  D: "Ð",
  E: "É",
  F: "Ƒ",
  G: "Ğ",
  H: "Ĥ",
  I: "Í",
  J: "Ĵ",
  K: "Ķ",
  L: "Ł",
  M: "Ɱ",
  N: "Ñ",
  O: "Ó",
  P: "Ƥ",
  Q: "Ɋ",
  R: "Ŕ",
  S: "Ş",
  T: "Ţ",
  U: "Ú",
  V: "Ṽ",
  W: "Ŵ",
  X: "Ẋ",
  Y: "Ý",
  Z: "Ż",
};

const PLACEHOLDER = /(\{\{\s*[A-Za-z0-9_]+\s*\}\})/g;
/** Non-global twin — `.test()` on a /g regex is stateful. */
const IS_PLACEHOLDER = /^\{\{\s*[A-Za-z0-9_]+\s*\}\}$/;

/** Roughly English → German expansion. */
const EXPANSION = 0.4;

/**
 * Unaccented text on screen is untranslated; a missing `]` means it clipped.
 * Placeholder contents are left alone or interpolation breaks.
 */
export function pseudoLocalize(template: string): string {
  const accented = template
    .split(PLACEHOLDER)
    .map(part =>
      IS_PLACEHOLDER.test(part)
        ? part
        : part.replace(/[A-Za-z]/g, ch => ACCENTS[ch] ?? ch),
    )
    .join("");

  const visible = template.replace(PLACEHOLDER, "").length;
  return `[${accented}${"·".repeat(Math.ceil(visible * EXPANSION))}]`;
}
