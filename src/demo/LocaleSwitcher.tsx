// Demo chrome stays untranslated on purpose — it is the visual boundary
// between library strings and host strings.

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
