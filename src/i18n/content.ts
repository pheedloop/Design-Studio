import type { FloorPlanData } from "../types";
import type { Exhibitor } from "../viewer/types";

/**
 * Translator for author-entered text, as opposed to `Translate`, which takes
 * manifest keys. Must be referentially stable.
 */
export type TranslateContent = (text: string) => string;

const sub = (text: string | undefined, translate: TranslateContent) =>
  text ? translate(text) || text : text;

/**
 * Applied once to the data, not at each render site: search matching has to see the
 * same text it displays, or a user gets hits they cannot see.
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

export function translateExhibitors(
  exhibitors: Exhibitor[],
  translate: TranslateContent,
): Exhibitor[] {
  return exhibitors.map(exhibitor => ({
    ...exhibitor,
    name: sub(exhibitor.name, translate) ?? exhibitor.name,
  }));
}
