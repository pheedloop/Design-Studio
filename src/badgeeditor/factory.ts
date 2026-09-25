// Field factory — creates a BadgeField with sensible inch defaults when added
// from the palette. Mirrors NewBadgeDesigner/NewFieldMenu.jsx `addField`
// defaults (px @ 96 DPI), converted to inches.

import { v4 as uuid } from "uuid";
import { pxToInch, type BadgeCustomField, type BadgeField } from "./model";
import type { T } from "./i18n";
import {
  getFieldDef,
  isLiteralTextField,
  isUserFieldEditable,
  kindForField,
} from "./fields";

export function fieldDisplayText(field: BadgeField, t: T): string {
  if (isLiteralTextField(field.field)) {
    return field.text ?? t("badgeeditor.field.customTextDefault");
  }
  const def = getFieldDef(field.field);
  return def ? t(def.labelKey) : field.field;
}

export function fieldHeading(field: BadgeField, t: T): string {
  if (field.field === "extra_fields") {
    return field.text ?? field.customAttendeeField ?? field.field;
  }
  const def = getFieldDef(field.field);
  return def ? t(def.labelKey) : field.field;
}

export function createField(
  fieldKey: string,
  literalText?: string,
): BadgeField {
  const kind = kindForField(fieldKey);
  const base: BadgeField = {
    id: uuid(),
    field: fieldKey,
    kind,
    top: pxToInch(50),
    left: pxToInch(50),
  };

  if (kind === "qrCode") {
    // Legacy: 75px image at scale 1, dropped near the top-left.
    return { ...base, top: pxToInch(10), left: pxToInch(10), scale: 1 };
  }

  if (kind === "tickets") {
    // Legacy: 250×400px, 3 rows.
    return {
      ...base,
      width: pxToInch(250),
      height: pxToInch(400),
      numRows: 3,
      textAlign: "left",
      inverted: false,
    };
  }

  if (kind === "image") {
    return { ...base, width: pxToInch(150), height: pxToInch(150) };
  }

  // text / sessionSchedule — legacy default fontSize 20, width 250px.
  const fontSize = 20;
  return {
    ...base,
    width: pxToInch(250),
    height: pxToInch(fontSize * 1.2), // one line
    fontSize,
    numLines: 1,
    textAlign: "center",
    inverted: false,
    userEditable: isUserFieldEditable(fieldKey) ? true : undefined,
    text: isLiteralTextField(fieldKey) ? literalText : undefined,
  };
}

export function createCustomField(custom: BadgeCustomField): BadgeField {
  return {
    ...createField("extra_fields", custom.label),
    customAttendeeField: custom.name,
  };
}
