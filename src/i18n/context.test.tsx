import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createSurfaceI18n, useLocale } from "./context";
import { I18nProvider } from "./I18nProvider";
import type { Vars } from "./types";
import type { Translate } from "./index";

// See translate.test.ts for why the fixtures are widened past StringKey.
type LooseT = (key: string, vars?: Vars) => string;

const STRINGS = { "common.legend": "Legend" };
const { useT } = createSurfaceI18n(STRINGS);
const useLooseT = useT as unknown as () => LooseT;

function Label() {
  const t = useLooseT();
  return <span data-testid="label">{t("common.legend")}</span>;
}

function Locale() {
  return <span data-testid="locale">{useLocale() ?? "(none)"}</span>;
}

const shout: Translate = (key) => `SHOUT:${key}`;
const whisper: Translate = (key) => `whisper:${key}`;

const label = () => screen.getByTestId("label").textContent;

describe("English fallback", () => {
  it("renders the built-in English with no provider at all", () => {
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
    expect(label()).toBe("SHOUT:common.legend");
  });

  it("inherits through a nested provider that passes no translator", () => {
    // SeatPlanCanvas nested inside SeatPlanViewer.
    render(
      <I18nProvider translate={shout}>
        <I18nProvider>
          <Label />
        </I18nProvider>
      </I18nProvider>,
    );
    expect(label()).toBe("SHOUT:common.legend");
  });

  it("lets a nested provider override with its own translator", () => {
    render(
      <I18nProvider translate={shout}>
        <I18nProvider translate={whisper}>
          <Label />
        </I18nProvider>
      </I18nProvider>,
    );
    expect(label()).toBe("whisper:common.legend");
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
  // t goes in useMemo dependency arrays: stability avoids re-deriving the editor
  // every render, and changing on a swap is what rebuilds memoized strings.
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
    expect(label()).toBe("SHOUT:common.legend");

    rerender(
      <I18nProvider translate={whisper}>
        <Label />
      </I18nProvider>,
    );
    expect(label()).toBe("whisper:common.legend");
  });
});
