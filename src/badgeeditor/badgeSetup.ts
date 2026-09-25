import { v4 as uuid } from "uuid";
import {
  PAGE_COUNT,
  pageRoleForIndex,
  type BadgeDocument,
  type BadgePage,
  type FoldType,
  type HolePunch,
} from "./model";
import { foldInvertForPage } from "./serialize";

export const DEFAULT_TEARAWAYS = 3;

export interface PanelConfig {
  inverted: boolean;
  tearaway: boolean;
  tearawayCount: number;
}

export interface BadgeSetup {
  fold: FoldType;
  panelSize: { width: number; height: number };
  panels: PanelConfig[];
  holePunch: HolePunch | null;
  cornerRadiusMm: number;
}

function sameHolePunch(a: HolePunch | null, b: HolePunch | null): boolean {
  if (!a || !b) return a === b;
  return (
    a.shape === b.shape &&
    a.count === b.count &&
    a.widthMm === b.widthMm &&
    a.heightMm === b.heightMm &&
    a.pitchMm === b.pitchMm &&
    a.topOffsetMm === b.topOffsetMm
  );
}

function samePanel(
  page: BadgePage | undefined,
  panel: PanelConfig,
  role: BadgePage["role"],
  defaultInverted: boolean,
): boolean {
  return (
    page !== undefined &&
    page.role === role &&
    (page.inverted ?? defaultInverted) === panel.inverted &&
    (page.tearaway ?? false) === panel.tearaway &&
    (page.tearawayCount ?? DEFAULT_TEARAWAYS) === panel.tearawayCount
  );
}

export function applyBadgeSetup(
  doc: BadgeDocument,
  setup: BadgeSetup,
): BadgeDocument {
  const { fold, panelSize, holePunch, cornerRadiusMm } = setup;
  const count = PAGE_COUNT[fold];
  const panels = Array.from(
    { length: count },
    (_, i): PanelConfig =>
      setup.panels[i] ?? {
        inverted: foldInvertForPage(fold, i),
        tearaway: false,
        tearawayCount: DEFAULT_TEARAWAYS,
      },
  );

  const unchanged =
    doc.fold === fold &&
    doc.pages.length === count &&
    doc.panelSize.width === panelSize.width &&
    doc.panelSize.height === panelSize.height &&
    sameHolePunch(doc.holePunch ?? null, holePunch) &&
    (doc.cornerRadiusMm ?? 0) === cornerRadiusMm &&
    panels.every((panel, i) =>
      samePanel(
        doc.pages[i],
        panel,
        pageRoleForIndex(count, i),
        foldInvertForPage(fold, i),
      ),
    );
  if (unchanged) return doc;

  const pages = panels.map((panel, i): BadgePage => {
    const props = { role: pageRoleForIndex(count, i), ...panel };
    const existing = doc.pages[i];
    return existing
      ? { ...existing, ...props }
      : { id: uuid(), fields: [], ...props };
  });
  return { ...doc, fold, panelSize, holePunch, cornerRadiusMm, pages };
}
