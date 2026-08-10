// ---------------------------------------------------------------------------
// Pseudo-localization
// ---------------------------------------------------------------------------
//
// A fake translation that makes three separate classes of bug visible without
// anyone having to speak a second language. Demo-only — see src/demo/README-less
// note in useDemoLocale.ts for why this directory never ships.
//
// The transform is four steps, and the ORDER is load-bearing:
//
//   1. accent every ASCII letter        an unaccented word on screen is, by
//                                       construction, a string still hardcoded
//   2. wrap in [ … ]                    if you cannot see the closing bracket,
//                                       the container is clipping
//   3. pad to ~140%                     German and French run that much longer
//                                       than English; this is what breaks layouts
//   4. leave {{placeholders}} alone     accenting the inside of a placeholder
//                                       silently breaks interpolation, and you
//                                       will spend an hour chasing it
//
// Step 4 is why this transforms the TEMPLATE and lets the library interpolate
// afterwards. Host data substituted into a slot stays in plain characters, so at
// a glance you can tell library chrome (accented) from data (not).

const ACCENTS: Record<string, string> = {
  a: "á", b: "ƀ", c: "ç", d: "ð", e: "é", f: "ƒ", g: "ğ", h: "ĥ", i: "í",
  j: "ĵ", k: "ķ", l: "ł", m: "ɱ", n: "ñ", o: "ó", p: "ƥ", q: "ɋ", r: "ŕ",
  s: "ş", t: "ţ", u: "ú", v: "ṽ", w: "ŵ", x: "ẋ", y: "ý", z: "ż",
  A: "Á", B: "Ɓ", C: "Ç", D: "Ð", E: "É", F: "Ƒ", G: "Ğ", H: "Ĥ", I: "Í",
  J: "Ĵ", K: "Ķ", L: "Ł", M: "Ɱ", N: "Ñ", O: "Ó", P: "Ƥ", Q: "Ɋ", R: "Ŕ",
  S: "Ş", T: "Ţ", U: "Ú", V: "Ṽ", W: "Ŵ", X: "Ẋ", Y: "Ý", Z: "Ż",
};

/** Splits a template into placeholder and non-placeholder runs. */
const PLACEHOLDER = /(\{\{\s*[A-Za-z0-9_]+\s*\}\})/g;
/** Same pattern, anchored and non-global — `.test()` on a /g regex is stateful. */
const IS_PLACEHOLDER = /^\{\{\s*[A-Za-z0-9_]+\s*\}\}$/;

/** Roughly the expansion ratio English → German. */
const EXPANSION = 0.4;

export function pseudoLocalize(template: string): string {
  const accented = template
    .split(PLACEHOLDER)
    .map((part) =>
      // Odd-indexed parts are the placeholders themselves — pass them through
      // untouched or interpolation stops matching them.
      IS_PLACEHOLDER.test(part)
        ? part
        : part.replace(/[A-Za-z]/g, (ch) => ACCENTS[ch] ?? ch),
    )
    .join("");

  // Pad on visible characters only, so a string that is mostly placeholder does
  // not get a comically long tail.
  const visible = template.replace(PLACEHOLDER, "").length;
  const padding = "·".repeat(Math.ceil(visible * EXPANSION));

  return `[${accented}${padding}]`;
}
