import { ProductSwitcher } from "@/components/ProductSwitcher";
import { BadgeEditor } from "./BadgeEditor";
import { sampleAttendeeProvider } from "./sample-attendees";
import { LocaleSwitcher } from "@/demo/LocaleSwitcher";
import { useDemoLocale } from "@/demo/useDemoLocale";

/**
 * Badge product shell (demo). Mirrors SeatplannerApp — only an editor mode for
 * now; a viewer/preview mode arrives with the live-preview unit.
 */
export function BadgeEditorApp() {
  const { locale, setLocale, translate } = useDemoLocale();

  return (
    <div className="h-screen flex flex-col">
      <nav className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-xs shrink-0">
        <ProductSwitcher current="badges" mode="editor" />
        <div className="w-px h-4 bg-gray-700 mx-1" />
        <span className="px-3 py-1 rounded bg-white/15 text-white">Editor</span>
        <LocaleSwitcher locale={locale} setLocale={setLocale} />
      </nav>
      <div className="flex-1 overflow-hidden">
        <BadgeEditor
          debug
          translate={translate}
          attendeeProvider={sampleAttendeeProvider}
          onSave={(_doc, flattened) =>
            console.log("[badge] saved", flattened.layout)
          }
        />
      </div>
    </div>
  );
}
