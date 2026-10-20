// ---------------------------------------------------------------------------
// Serialization: BadgeDocument  <->  legacy badge_layout array
// ---------------------------------------------------------------------------
//
// flatten() collapses the page-aware BadgeDocument into the single flat array
// the pikachu ZPL pipeline already understands, reproducing the legacy Fabric
// serializers exactly (BadgeText/BadgeQRCode/BadgeImage/BadgeTickets.toObject).
// inflate() does the reverse for loading templates that have no rich
// editor_document yet.
//
// COMPATIBILITY IS LOAD-BEARING. The per-field math here must match
// raichu .../BadgeDesigner/editorClasses.jsx field-for-field.

import { v4 as uuid } from "uuid";
import {
  BACKEND_REFERENCE_FONT_SIZE,
  BACKGROUND_FIELD,
  BADGE_DOCUMENT_VERSION,
  PAGE_COUNT,
  inchToPx,
  pageRoleForIndex,
  type BadgeDocument,
  type BadgeField,
  type BackgroundFit,
  type BadgePage,
  type BadgePageBackground,
  type FlattenResult,
  type FoldType,
  type LegacyLayoutEntry,
} from "./model";
import { PPI, fieldSizePx, isFieldOutsidePanel } from "./canvasMetrics";
import {
  isLiteralTextField,
  isUserFieldEditable,
  kindForEntry,
  kindForField,
} from "./fields";

// ---------------------------------------------------------------------------
// Field -> legacy entry
// ---------------------------------------------------------------------------

interface FlattenContext {
  /** Inches added to the field's top to place it within the unfolded template. */
  offsetTop: number;
  /** Whether the page this field lives on is printed upside-down (fold). */
  foldInvert: boolean;
  panelWidth: number;
  panelHeight: number;
}

type SizedField = Pick<BadgeField, "kind" | "scale" | "width" | "height">;

function fieldSizeIn(field: SizedField): { w: number; h: number } {
  const { w, h } = fieldSizePx(field);
  return { w: w / PPI, h: h / PPI };
}

/**
 * Rotate a panel-local box 180° about the panel centre (its own inverse). This
 * is how a folded-back panel, authored upright, lands on the unfolded sheet.
 */
function mirrorInPanel(
  box: { top: number; left: number },
  size: { w: number; h: number },
  panel: { width: number; height: number },
): { top: number; left: number } {
  return {
    top: panel.height - box.top - size.h,
    left: panel.width - box.left - size.w,
  };
}

export function fieldToEntry(
  field: BadgeField,
  ctx: FlattenContext = {
    offsetTop: 0,
    foldInvert: false,
    panelWidth: 0,
    panelHeight: 0,
  },
): LegacyLayoutEntry {
  const kind = field.kind ?? kindForField(field.field);

  // Effective 180° rotation = user-applied inversion XOR page-fold inversion
  // (two 180° rotations cancel). The backend (badge_generator.py) renders
  // `inverted` as rotate(180deg) about the box CENTER, so a folded-back field
  // also has its box mirrored within the panel to match the printed sheet.
  const inverted = Boolean(field.inverted) !== ctx.foldInvert;
  const box = ctx.foldInvert
    ? mirrorInPanel(field, fieldSizeIn({ ...field, kind }), {
        width: ctx.panelWidth,
        height: ctx.panelHeight,
      })
    : field;
  const top = box.top + ctx.offsetTop;
  const left = box.left;

  // qrCode / image: legacy emits only position (+ scale or size); `inverted` is
  // omitted unless actually inverted (keeps single-page output byte-identical to
  // legacy while still flipping folded-back panels — the backend honours it).
  if (kind === "qrCode") {
    const entry: LegacyLayoutEntry = {
      top,
      left,
      field: field.field,
      scale: field.scale ?? 1,
    };
    if (field.printAsQr) entry.printAsQr = true;
    if (inverted) entry.inverted = true;
    return entry;
  }

  if (kind === "image") {
    const entry: LegacyLayoutEntry = {
      top,
      left,
      height: field.height,
      width: field.width,
      field: field.field,
      code: field.code,
    };
    if (inverted) entry.inverted = true;
    return entry;
  }

  if (kind === "tickets") {
    const entry: LegacyLayoutEntry = {
      top,
      left,
      field: field.field,
      height: field.height,
      width: field.width,
      numRows: field.numRows,
      inverted,
    };
    if (field.ticketCodes?.length) entry.ticketCodes = field.ticketCodes;
    return entry;
  }

  // text / sessionSchedule
  const fontSize = field.fontSize ?? BACKEND_REFERENCE_FONT_SIZE;
  const numLines =
    field.numLines ??
    (field.height != null ? Math.floor(inchToPx(field.height) / fontSize) : 1);

  const entry: LegacyLayoutEntry = {
    top,
    left,
    field: field.field,
    scale: fontSize / BACKEND_REFERENCE_FONT_SIZE,
    height: field.height,
    width: field.width,
    fontSize,
    numLines,
    textAlign: field.textAlign ?? "center",
    inverted,
  };
  if (field.customAttendeeField != null) {
    entry.custom_attendee_field = field.customAttendeeField;
  }
  if (isLiteralTextField(field.field)) {
    entry.text = field.text;
  }
  if (isUserFieldEditable(field.field)) {
    entry.userEditable = field.userEditable ?? true;
  }
  return entry;
}

// ---------------------------------------------------------------------------
// Document -> flat layout
// ---------------------------------------------------------------------------

/**
 * Default "prints upside-down" seed per panel, used when a page has no explicit
 * `inverted` override. Vertical stack, top→bottom:
 *  - single (2 panels): top = Front upright, bottom = Back folds up behind → inverted.
 *  - double (3 panels): Z-fold guess (middle inverted) — pending a real test print.
 * The per-page `inverted` override settles the actual physical fold.
 */
export function foldInvertForPage(fold: FoldType, pageIndex: number): boolean {
  if (fold === "single") return pageIndex === 1;
  if (fold === "double") return pageIndex === 1;
  return false;
}

export interface FlattenOptions {
  /** Inches of print overshoot the host's printer tolerates. Default 0 (strict). */
  printOvershootAllowanceIn?: number;
}

/**
 * A panel background spans its whole panel, so fold inversion rotates it in
 * place: only `inverted` changes, never the box.
 */
function backgroundToEntry(
  background: BadgePageBackground,
  ctx: FlattenContext,
): LegacyLayoutEntry {
  const entry: LegacyLayoutEntry = {
    top: ctx.offsetTop,
    left: 0,
    width: ctx.panelWidth,
    height: ctx.panelHeight,
    field: BACKGROUND_FIELD,
    code: background.imageCode,
    fit: background.fit,
  };
  if (ctx.foldInvert) entry.inverted = true;
  return entry;
}

export function flatten(
  doc: BadgeDocument,
  options?: FlattenOptions,
): FlattenResult {
  const allowanceIn = options?.printOvershootAllowanceIn ?? 0;
  const panelHeight = doc.panelSize.height;
  // Backgrounds lead the layout: the backend paints entries in order.
  const backgrounds: LegacyLayoutEntry[] = [];
  const fields: LegacyLayoutEntry[] = [];

  doc.pages.forEach((page, pageIndex) => {
    const ctx: FlattenContext = {
      offsetTop: pageIndex * panelHeight,
      foldInvert: page.inverted ?? foldInvertForPage(doc.fold, pageIndex),
      panelWidth: doc.panelSize.width,
      panelHeight,
    };
    if (page.background) {
      backgrounds.push(backgroundToEntry(page.background, ctx));
    }
    for (const field of page.fields) {
      if (isFieldOutsidePanel(field, doc.panelSize, allowanceIn)) continue;
      fields.push(fieldToEntry(field, ctx));
    }
  });

  return {
    layout: [...backgrounds, ...fields],
    width: doc.panelSize.width,
    height: panelHeight * doc.pages.length,
  };
}

// ---------------------------------------------------------------------------
// Flat layout -> document
// ---------------------------------------------------------------------------

/**
 * Recover a BadgeField from a legacy entry. Stored top/left is the footprint
 * top-left (matches the backend's rotate-about-center).
 */
export function entryToField(entry: LegacyLayoutEntry): BadgeField {
  const kind = kindForEntry(entry);
  const inverted = Boolean(entry.inverted);

  const base: BadgeField = {
    id: uuid(),
    field: entry.field,
    kind,
    top: entry.top,
    left: entry.left,
  };

  if (kind === "qrCode") {
    return entry.printAsQr
      ? { ...base, scale: entry.scale ?? 1, printAsQr: true, inverted }
      : { ...base, scale: entry.scale ?? 1, inverted };
  }
  if (kind === "image") {
    return {
      ...base,
      width: entry.width,
      height: entry.height,
      code: entry.code,
      inverted,
    };
  }
  if (kind === "tickets") {
    const field: BadgeField = {
      ...base,
      width: entry.width,
      height: entry.height,
      numRows: entry.numRows,
      inverted,
    };
    return entry.ticketCodes?.length
      ? { ...field, ticketCodes: entry.ticketCodes }
      : field;
  }

  // text / sessionSchedule
  return {
    ...base,
    width: entry.width,
    height: entry.height,
    fontSize: entry.fontSize,
    numLines: entry.numLines,
    textAlign: entry.textAlign,
    inverted,
    text: entry.text,
    customAttendeeField: entry.custom_attendee_field ?? null,
    userEditable: entry.userEditable,
  };
}

function entrySizeIn(entry: LegacyLayoutEntry): { w: number; h: number } {
  return fieldSizeIn({ ...entry, kind: kindForEntry(entry) });
}

type BackgroundEntry = LegacyLayoutEntry &
  Required<Pick<LegacyLayoutEntry, "code" | "fit" | "height">>;

const BACKGROUND_FITS: readonly BackgroundFit[] = [
  "cover",
  "contain",
  "stretch",
];

/** Only the shape `flatten` writes is a background; anything else stays a field. */
function isBackgroundEntry(entry: LegacyLayoutEntry): entry is BackgroundEntry {
  return (
    entry.field === BACKGROUND_FIELD &&
    typeof entry.code === "string" &&
    BACKGROUND_FITS.includes(entry.fit as BackgroundFit) &&
    typeof entry.height === "number" &&
    entry.height > 0
  );
}

/**
 * The fold a layout with no editor document was saved with, read from its
 * panel backgrounds. Without them the fold cannot be told apart, so "none".
 */
export function inferFold(
  layout: LegacyLayoutEntry[],
  templateHeight: number,
): FoldType {
  const background = layout.find(isBackgroundEntry);
  if (!background) return "none";
  const count = Math.round(templateHeight / background.height);
  const fold = (Object.keys(PAGE_COUNT) as FoldType[]).find(
    key => PAGE_COUNT[key] === count,
  );
  return fold ?? "none";
}

export interface InflateOptions {
  /** Full template size in INCHES (BadgeTemplate.width/height). */
  width: number;
  height: number;
  fold?: FoldType;
}

export function inflate(
  layout: LegacyLayoutEntry[],
  opts: InflateOptions,
): BadgeDocument {
  const fold = opts.fold ?? "none";
  const pageCount = PAGE_COUNT[fold];
  const panelHeight = opts.height / pageCount;
  const pages: BadgePage[] = Array.from({ length: pageCount }, (_, i) => ({
    id: uuid(),
    role: pageRoleForIndex(pageCount, i),
    fields: [],
  }));

  const panelIndex = (top: number) =>
    Math.min(
      pageCount - 1,
      Math.max(0, panelHeight > 0 ? Math.floor(top / panelHeight) : 0),
    );

  for (const entry of layout.filter(isBackgroundEntry)) {
    const index = panelIndex(entry.top + entry.height / 2);
    const page = pages[index];
    page.background = { imageCode: entry.code, fit: entry.fit };
    if (Boolean(entry.inverted) !== foldInvertForPage(fold, index)) {
      page.inverted = Boolean(entry.inverted);
    }
  }
  const pageInverts = pages.map(
    (page, i) => page.inverted ?? foldInvertForPage(fold, i),
  );

  for (const entry of layout) {
    if (isBackgroundEntry(entry)) continue;
    const size = entrySizeIn(entry);
    const pageIndex = panelIndex(entry.top + size.h / 2);
    const foldInvert = pageInverts[pageIndex];
    const local = {
      top: entry.top - pageIndex * panelHeight,
      left: entry.left,
    };
    const box = foldInvert
      ? mirrorInPanel(local, size, { width: opts.width, height: panelHeight })
      : local;
    const field = entryToField({ ...entry, ...box });
    field.inverted = Boolean(entry.inverted) !== foldInvert;
    pages[pageIndex].fields.push(field);
  }

  return {
    version: BADGE_DOCUMENT_VERSION,
    panelSize: { width: opts.width, height: panelHeight },
    fold,
    pages,
  };
}
