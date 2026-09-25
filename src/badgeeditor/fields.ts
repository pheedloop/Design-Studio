// ---------------------------------------------------------------------------
// Field registry
// ---------------------------------------------------------------------------
//
// The palette of fields a badge can contain, ported from the CURRENT Raichu
// designer (NewBadgeDesigner: TextFieldNames.jsx + UNEDITABLE_FIELDS, which
// reuses BadgeDesigner/editorClasses for serialization). Each field maps to a
// FieldKind that drives rendering, controls, and serialization.
//
// Note: NewBadgeDesigner also injects per-event "custom attendee fields" into
// the menu dynamically; those serialize as field="extra_fields" with a
// custom_attendee_field key. They are not part of this static registry — the
// palette receives them at runtime (see kindForField/isLiteralTextField, which
// already handle "extra_fields").

import type { FieldKind } from "./model";
import type { StringKey } from "./i18n";

export interface FieldDef {
  /** Backend field identifier (also the key in TextFieldNames). */
  field: string;
  labelKey: StringKey;
  kind: FieldKind;
  /** Whether this field appears in the field menu. Defaults to true; `image`
   *  sets false (added via the image gallery instead). */
  inPalette?: boolean;
}

/**
 * Fields whose value the attendee may NOT edit at print time. Everything else
 * defaults to userEditable. Ported from NewBadgeDesigner/constants.jsx.
 */
export const UNEDITABLE_FIELDS = [
  "custom_text",
  "tags",
  "code_internal",
  "table_number",
] as const;

/** Mirror of NewBadgeDesigner/helper.js `isUserFieldEditableEnable`. */
export const isUserFieldEditable = (field: string | undefined): boolean => {
  if (!field) return false;
  return !UNEDITABLE_FIELDS.includes(
    field as (typeof UNEDITABLE_FIELDS)[number],
  );
};

/**
 * Ordered palette. Order mirrors NewBadgeDesigner/TextFieldNames.jsx.
 * `externalQRCodeUrl` uses the same BadgeQRCode class as `qrCode` (kind
 * "qrCode"). `image` is placed via the image gallery rather than the field
 * menu, but lives in the same registry for kind lookup (see inPalette=false).
 */
export const FIELD_DEFS: FieldDef[] = [
  { field: "name", labelKey: "badgeeditor.field.fullName", kind: "text" },
  {
    field: "first_name",
    labelKey: "badgeeditor.field.firstName",
    kind: "text",
  },
  { field: "last_name", labelKey: "badgeeditor.field.lastName", kind: "text" },
  { field: "tags", labelKey: "badgeeditor.field.tags", kind: "text" },
  { field: "qrCode", labelKey: "badgeeditor.field.qrCode", kind: "qrCode" },
  {
    field: "externalQRCodeUrl",
    labelKey: "badgeeditor.field.externalQrCode",
    kind: "qrCode",
  },
  {
    field: "organization",
    labelKey: "badgeeditor.field.organization",
    kind: "text",
  },
  { field: "title", labelKey: "badgeeditor.field.jobTitle", kind: "text" },
  {
    field: "designations",
    labelKey: "badgeeditor.field.designations",
    kind: "text",
  },
  { field: "pronouns", labelKey: "badgeeditor.field.pronouns", kind: "text" },
  {
    field: "address_city",
    labelKey: "badgeeditor.field.addressCity",
    kind: "text",
  },
  {
    field: "address_country",
    labelKey: "badgeeditor.field.addressCountry",
    kind: "text",
  },
  {
    field: "address_state",
    labelKey: "badgeeditor.field.addressState",
    kind: "text",
  },
  {
    field: "city_state",
    labelKey: "badgeeditor.field.cityState",
    kind: "text",
  },
  {
    field: "session_schedule",
    labelKey: "badgeeditor.field.sessionSchedule",
    kind: "sessionSchedule",
  },
  {
    field: "custom_text",
    labelKey: "badgeeditor.field.customText",
    kind: "text",
  },
  { field: "tickets", labelKey: "badgeeditor.field.tickets", kind: "tickets" },
  {
    field: "code_internal",
    labelKey: "badgeeditor.field.codeInternal",
    kind: "text",
  },
  {
    field: "table_number",
    labelKey: "badgeeditor.field.tableNumber",
    kind: "text",
  },
  {
    field: "dietary_restrictions",
    labelKey: "badgeeditor.field.dietaryRestrictions",
    kind: "text",
  },
  // Placed via the image gallery, not the field menu.
  {
    field: "image",
    labelKey: "badgeeditor.field.image",
    kind: "image",
    inPalette: false,
  },
];

const FIELD_DEF_BY_KEY: Record<string, FieldDef> = Object.fromEntries(
  FIELD_DEFS.map(d => [d.field, d]),
);

export const getFieldDef = (field: string): FieldDef | undefined =>
  FIELD_DEF_BY_KEY[field];

/**
 * Resolve a field key to its kind. Unknown keys (e.g. custom attendee fields
 * surfaced as `extra_fields`) default to text.
 */
export const kindForField = (field: string): FieldKind =>
  FIELD_DEF_BY_KEY[field]?.kind ?? "text";

/** Fields whose `text` literal is part of the layout (designer-authored copy). */
export const isLiteralTextField = (field: string): boolean =>
  field === "custom_text" || field === "extra_fields";
