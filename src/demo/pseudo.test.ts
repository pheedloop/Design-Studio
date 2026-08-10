import { describe, expect, it } from "vitest";
import { pseudoLocalize } from "./pseudo";

describe("pseudoLocalize", () => {
  it("brackets the string so clipping is visible", () => {
    const out = pseudoLocalize("Legend");
    expect(out.startsWith("[")).toBe(true);
    expect(out.endsWith("]")).toBe(true);
  });

  it("accents every ASCII letter, so anything unaccented is untranslated", () => {
    const out = pseudoLocalize("Legend");
    expect(out).toContain("Łéğéñð");
    expect(/[A-Za-z]/.test(out)).toBe(false);
  });

  it("pads to simulate text expansion", () => {
    const out = pseudoLocalize("Legend");
    expect(out).toContain("·");
    expect(out.length).toBeGreaterThan("Legend".length + 2);
  });

  it("leaves placeholder names untouched", () => {
    const out = pseudoLocalize("Hello {{name}}");
    expect(out).toContain("{{name}}");
    expect(out).not.toContain("{{ñáɱé}}");
  });

  it("leaves placeholders with inner whitespace untouched", () => {
    expect(pseudoLocalize("{{  count  }} seats")).toContain("{{  count  }}");
  });

  it("still accents the text around a placeholder", () => {
    const out = pseudoLocalize("Hello {{name}}");
    expect(out).toContain("Ĥéłłó");
  });

  it("handles a template that is only a placeholder", () => {
    const out = pseudoLocalize("{{count}}");
    expect(out).toBe("[{{count}}]");
  });

  it("handles multiple placeholders", () => {
    const out = pseudoLocalize("{{a}} of {{b}}");
    expect(out).toContain("{{a}}");
    expect(out).toContain("{{b}}");
    expect(out).toContain("óƒ");
  });

  it("is not stateful across calls", () => {
    const first = pseudoLocalize("Hello {{name}}");
    const second = pseudoLocalize("Hello {{name}}");
    expect(second).toBe(first);
  });

  it("preserves punctuation and non-ASCII characters", () => {
    const out = pseudoLocalize("Loading…");
    expect(out).toContain("…");
  });
});
