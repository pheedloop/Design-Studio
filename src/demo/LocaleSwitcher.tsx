// Demo-only locale toggle. Styled to match the tier buttons in MapApp's nav.
//
// The demo's own chrome — this switcher, the product tabs, the tier and viewport
// buttons — is deliberately NOT translated. That gives a visual boundary while
// testing: anything bracketed and accented is the library, anything in plain
// English is the host. Please keep it that way.

import { DEMO_LOCALES, type DemoLocale } from "./useDemoLocale";

export function LocaleSwitcher({
  locale,
  setLocale,
}: {
  locale: DemoLocale;
  setLocale: (locale: DemoLocale) => void;
}) {
  return (
    <>
      <div className="w-px h-4 bg-gray-700 mx-1" />
      <span className="text-gray-500 mr-0.5">Lang:</span>
      {DEMO_LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
            locale === l.id
              ? "bg-white/15 text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
          title={l.title}
        >
          {l.label}
        </button>
      ))}
    </>
  );
}
