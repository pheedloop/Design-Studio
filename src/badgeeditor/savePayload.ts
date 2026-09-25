import type { BadgeDocument, FlattenResult } from "./model";
import { flatten } from "./serialize";

export function savePayload(
  doc: BadgeDocument,
  name: string | undefined,
  thumbnail: Blob | null,
): [BadgeDocument, FlattenResult, Blob | null] {
  const saved = name === undefined ? doc : { ...doc, name };
  return [saved, flatten(saved), thumbnail];
}
