import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createSurfaceI18n, useLocale } from "./context";
import { I18nProvider } from "./I18nProvider";
import type { Translate, Vars } from "./types";

// See translate.test.ts for why the fixtures are widened past StringKey.
type LooseT = (key: string, vars?: Vars) => string;

const STRINGS = { "viewer.legend.title": "Legend" };
const { useT } = createSurfaceI18n(STRINGS);
const useLooseT = useT as unknown as () => LooseT;

/** Renders one string, so the test can read what a component would display. */
function Label() {
  const t = useLooseT();
  return <span data-testid="label">{t("viewer.legend.title")}</span>;
}

function Locale() {
  return <span data-testid="locale">{useLocale() ?? "(none)"}</span>;
}

const shout: Translate = (key) => `SHOUT:${key}`;
const whisper: Translate = (key) => `whisper:${key}`;

const label = () => screen.getByTestId("label").textContent;

describe("English fallback", () => {
  it("renders the built-in English with no provider at all", () => {
    // The guarantee the design rests on: a host that upgrades and passes
    // nothing sees exactly what it saw before.
    render(<Label />);
    expect(label()).toBe("Legend");
  });

  it("renders the built-in English when a provider passes no translator", () => {
    render(
      <I18nProvider>
        <Label />
      </I18nProvider>,
    );
    expect(label()).toBe("Legend");
  });
});

describe("provider", () => {
  it("uses the host translator", () => {
    render(
      <I18nProvider translate={shout}>
        <Label />
      </I18nProvider>,
    );
    expect(label()).toBe("SHOUT:viewer.legend.title");
  });

  it("inherits through a nested provider that passes no translator", () => {
    // This is SeatPlanCanvas nested inside SeatPlanViewer. The canvas is
    // published separately so it takes its own props, but leaving them
    // undefined must not reset the subtree to English.
    render(
      <I18nProvider translate={shout}>
        <I18nProvider>
          <Label />
        </I18nProvider>
      </I18nProvider>,
    );
    expect(label()).toBe("SHOUT:viewer.legend.title");
  });

  it("lets a nested provider override with its own translator", () => {
    render(
      <I18nProvider translate={shout}>
        <I18nProvider translate={whisper}>
          <Label />
        </I18nProvider>
      </I18nProvider>,
    );
    expect(label()).toBe("whisper:viewer.legend.title");
  });

  it("inherits locale independently of translate", () => {
    render(
      <I18nProvider translate={shout} locale="fr-CA">
        <I18nProvider translate={whisper}>
          <Locale />
        </I18nProvider>
      </I18nProvider>,
    );
    expect(screen.getByTestId("locale").textContent).toBe("fr-CA");
  });

  it("reports no locale when none was supplied", () => {
    render(<Locale />);
    expect(screen.getByTestId("locale").textContent).toBe("(none)");
  });
});

describe("t identity", () => {
  // Components put t in useMemo/useCallback dependency arrays. Stability keeps
  // the editor from re-deriving every menu and tool list on each keystroke;
  // changing on a language switch is what makes memoized strings rebuild.
  function Probe({ seen }: { seen: LooseT[] }) {
    const t = useLooseT();
    seen.push(t);
    return null;
  }

  it("is stable across re-renders while the translator is unchanged", () => {
    const seen: LooseT[] = [];
    const { rerender } = render(
      <I18nProvider translate={shout}>
        <Probe seen={seen} />
      </I18nProvider>,
    );
    rerender(
      <I18nProvider translate={shout}>
        <Probe seen={seen} />
      </I18nProvider>,
    );

    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[seen.length - 1]).toBe(seen[0]);
  });

  it("is stable with no translator, across re-renders", () => {
    const seen: LooseT[] = [];
    const { rerender } = render(<Probe seen={seen} />);
    rerender(<Probe seen={seen} />);

    expect(seen[seen.length - 1]).toBe(seen[0]);
  });

  it("changes when the translator changes, so memoized strings rebuild", () => {
    const seen: LooseT[] = [];
    const { rerender } = render(
      <I18nProvider translate={shout}>
        <Probe seen={seen} />
      </I18nProvider>,
    );
    const before = seen[seen.length - 1];

    rerender(
      <I18nProvider translate={whisper}>
        <Probe seen={seen} />
      </I18nProvider>,
    );

    expect(seen[seen.length - 1]).not.toBe(before);
  });

  it("re-renders children with the new language on a translator swap", () => {
    const { rerender } = render(
      <I18nProvider translate={shout}>
        <Label />
      </I18nProvider>,
    );
    expect(label()).toBe("SHOUT:viewer.legend.title");

    rerender(
      <I18nProvider translate={whisper}>
        <Label />
      </I18nProvider>,
    );
    expect(label()).toBe("whisper:viewer.legend.title");
  });
});
