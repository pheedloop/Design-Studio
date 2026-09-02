import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as canvas from "./canvasColors";

// canvasColors.ts restates tokens.css by hand, because Konva takes strings and
// cannot read a CSS variable. This reads the stylesheet and checks the two agree,
// so the duplication cannot drift unnoticed.
const css = readFileSync(resolve(process.cwd(), "src/tokens.css"), "utf8");

const tokenHex = (name: string): string => {
  const m = new RegExp(`--${name}: (\\d+) (\\d+) (\\d+);`).exec(css);
  if (!m) throw new Error(`--${name} not found in tokens.css`);
  const [, r, g, b] = m;
  return (
    "#" + [r, g, b].map(v => Number(v).toString(16).padStart(2, "0")).join("")
  );
};

describe("canvasColors mirrors tokens.css", () => {
  it.each([
    ["BRAND", "primary-600"],
    ["BRAND_DARK", "primary-700"],
    ["GRAY_100", "gray-100"],
    ["GRAY_200", "gray-200"],
    ["GRAY_300", "gray-300"],
    ["GRAY_400", "gray-400"],
    ["GRAY_500", "gray-500"],
    ["GRAY_600", "gray-600"],
    ["GRAY_700", "gray-700"],
    ["GRAY_800", "gray-800"],
    ["GRAY_900", "gray-900"],
  ])("%s equals --%s", (constant, token) => {
    expect(canvas[constant as keyof typeof canvas]).toBe(tokenHex(token));
  });

  it("white and black are the CSS values too", () => {
    expect(canvas.WHITE).toBe("#ffffff");
    expect(canvas.BLACK).toBe("#000000");
  });
});
