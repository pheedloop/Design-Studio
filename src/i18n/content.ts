import type { FloorPlanData } from "../types";
import type { Exhibitor } from "../viewer/types";

/**
 * Translator for author-entered text — element names, text boxes, legend labels —
 * as opposed to `Translate`, which takes manifest keys. Hosts keying a catalog by
 * English source text can wire the same lookup to both.
 *
 * Must be referentially stable; the translated data is memoized off its identity.
 */
export type TranslateContent = (text: string) => string;

/** Passes a value through only when it has something to translate. */
const sub = (text: string | undefined, translate: TranslateContent) =>
  text ? translate(text) : text;

/**
 * A copy of `data` with every author-entered string translated.
 *
 * Applied once to the data rather than at each render site, so the ~15 places that
 * read a name — lists, popovers, canvas labels, search index, directions — all
 * agree. Search matching in particular has to see the same text it displays, or a
 * user gets hits they cannot see.
 */
export function translateFloorPlan(
  data: FloorPlanData,
  translate: TranslateContent,
): FloorPlanData {
  return {
    ...data,
    elements: data.elements.map(element => ({
      ...element,
      properties: {
        ...element.properties,
        name: sub(element.properties.name, translate),
        text: sub(element.properties.text, translate),
      },
    })),
    legend: {
      ...data.legend,
      entries: data.legend.entries.map(entry => ({
        ...entry,
        label: sub(entry.label, translate) ?? entry.label,
      })),
    },
  };
}

/** Exhibitor names are author-entered too, so they translate like any other UGC. */
export function translateExhibitors(
  exhibitors: Exhibitor[],
  translate: TranslateContent,
): Exhibitor[] {
  return exhibitors.map(exhibitor => ({
    ...exhibitor,
    name: sub(exhibitor.name, translate) ?? exhibitor.name,
  }));
}
