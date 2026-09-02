/**
 * Colours for the Konva layers.
 *
 * Konva takes colour strings, not classes, so the canvas cannot reach the CSS
 * tokens and these values are duplicated from tokens.css by hand. Keep them in
 * step with it.
 */

// Mirrors --primary-* and --gray-* in tokens.css.
export const BRAND = "#007bff";
export const BRAND_DARK = "#0063cc";
export const WHITE = "#ffffff";
export const BLACK = "#000000";

export const GRAY_100 = "#f5f8fc";
export const GRAY_200 = "#e9edf6";
export const GRAY_300 = "#c7d3e2";
export const GRAY_400 = "#8295ac";
export const GRAY_500 = "#5b708b";
export const GRAY_600 = "#425773";
export const GRAY_700 = "#263b5a";
export const GRAY_800 = "#152841";
export const GRAY_900 = "#09203a";

/** Ruler and grid chrome. */
export const CHROME_BG = GRAY_100;
export const CHROME_RULE = GRAY_300;
export const CHROME_TICK = GRAY_400;
export const CHROME_TEXT = GRAY_500;
export const CHROME_STRONG = GRAY_600;
export const CHROME_INK = GRAY_900;
