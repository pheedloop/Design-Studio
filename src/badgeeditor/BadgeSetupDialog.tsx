import { useState } from "react";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import { Dialog, NumberInput, SectionLabel } from "@/editor/components/ui";
import { fmtUnit, unitLabel, unitName, type Unit } from "./units";
import {
  PAGE_COUNT,
  pageRoleForIndex,
  pageRoleLabel,
  type BadgePage,
  type FoldType,
  type SlotType,
} from "./model";
import { foldInvertForPage } from "./serialize";
import { DimField } from "./DimField";

const FOLD_OPTIONS: { value: FoldType; label: string }[] = [
  { value: "none", label: "No fold" },
  { value: "single", label: "Single fold" },
  { value: "double", label: "Double fold" },
];

const SLOT_OPTIONS: { value: SlotType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "two-circle", label: "Two circular" },
  { value: "three-rect", label: "Three rectangular" },
];

const DEFAULT_TEARAWAYS = 3;

/** Per-panel configuration edited in the dialog. */
export interface PanelConfig {
  inverted: boolean;
  tearaway: boolean;
  tearawayCount: number;
}

interface BadgeSetupDialogProps {
  fold: FoldType;
  panelSize: { width: number; height: number };
  pages: BadgePage[];
  slots: SlotType;
  /** Display/input unit. Panel sizes are stored in inches regardless. */
  unit: Unit;
  /** Change the editor's measurement unit (applies live). */
  onUnitChange: (unit: Unit) => void;
  onApply: (
    fold: FoldType,
    panelSize: { width: number; height: number },
    panels: PanelConfig[],
    slots: SlotType,
  ) => void;
  onClose: () => void;
}

function panelConfigFor(
  pages: BadgePage[],
  fold: FoldType,
  i: number,
): PanelConfig {
  return {
    inverted: pages[i]?.inverted ?? foldInvertForPage(fold, i),
    tearaway: pages[i]?.tearaway ?? false,
    tearawayCount: pages[i]?.tearawayCount ?? DEFAULT_TEARAWAYS,
  };
}

export function BadgeSetupDialog({
  fold,
  panelSize,
  pages,
  slots,
  unit,
  onUnitChange,
  onApply,
  onClose,
}: BadgeSetupDialogProps) {
  const [localFold, setLocalFold] = useState<FoldType>(fold);
  const [w, setW] = useState(panelSize.width);
  const [h, setH] = useState(panelSize.height);
  const [localSlots, setLocalSlots] = useState<SlotType>(slots);
  const [panels, setPanels] = useState<PanelConfig[]>(() =>
    Array.from({ length: PAGE_COUNT[fold] }, (_, i) =>
      panelConfigFor(pages, fold, i),
    ),
  );

  const count = PAGE_COUNT[localFold];

  const changeFold = (f: FoldType) => {
    setLocalFold(f);
    setPanels(prev =>
      Array.from({ length: PAGE_COUNT[f] }, (_, i) =>
        i < prev.length
          ? prev[i]
          : {
              inverted: foldInvertForPage(f, i),
              tearaway: false,
              tearawayCount: DEFAULT_TEARAWAYS,
            },
      ),
    );
  };

  const setPanel = (i: number, patch: Partial<PanelConfig>) =>
    setPanels(prev => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <Dialog
      title="Badge Setup"
      onClose={onClose}
      width="400px"
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={() => {
              onApply(localFold, { width: w, height: h }, panels, localSlots);
              onClose();
            }}
          >
            Apply
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-s p-4">
        <div className="flex flex-col gap-xxxs.5">
          <SectionLabel>Fold</SectionLabel>
          <div className="flex gap-xxs">
            {FOLD_OPTIONS.map(o => (
              <Button
                key={o.value}
                variant="outline"
                color={localFold === o.value ? "primary" : "neutral"}
                active={localFold === o.value}
                className="flex-1"
                onClick={() => changeFold(o.value)}
              >
                {o.label}
              </Button>
            ))}
          </div>
          <span className="text-[11px] text-text-subtle">
            {count} panel{count > 1 ? "s" : ""}, stacked top-to-bottom
          </span>
        </div>

        <div className="flex flex-col gap-xxxs.5">
          <SectionLabel>Units</SectionLabel>
          <div className="flex gap-xxs">
            {(["in", "cm"] as Unit[]).map(u => (
              <Button
                key={u}
                variant="outline"
                color={unit === u ? "primary" : "neutral"}
                active={unit === u}
                className="flex-1"
                onClick={() => onUnitChange(u)}
              >
                {unitName[u]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-xs">
          <DimField label="Panel width" value={w} unit={unit} onChange={setW} />
          <DimField
            label="Panel height"
            value={h}
            unit={unit}
            onChange={setH}
          />
        </div>

        <div className="text-xs text-text-caption">
          Prints as{" "}
          <span className="font-medium text-text-body">
            {fmtUnit(w, unit)} × {fmtUnit(h * count, unit)} {unitLabel[unit]}
          </span>
          {count > 1 && " (unfolded)"}
        </div>

        <div className="flex flex-col gap-xxxs.5">
          <SectionLabel>Lanyard slots</SectionLabel>
          <div className="flex gap-xxs">
            {SLOT_OPTIONS.map(o => (
              <Button
                key={o.value}
                variant="outline"
                color={localSlots === o.value ? "primary" : "neutral"}
                active={localSlots === o.value}
                className="flex-1 text-[11px]"
                onClick={() => setLocalSlots(o.value)}
              >
                {o.label}
              </Button>
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="flex flex-col gap-xxxs.5">
            <SectionLabel>Panels</SectionLabel>
            <div className="flex flex-col gap-xxxs.5">
              {panels.map((cfg, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-xxxs.5 px-2.5 py-2 rounded border border-border-neutral-light"
                >
                  <span className="text-xs font-medium text-text-body">
                    {pageRoleLabel(pageRoleForIndex(count, i))}
                  </span>
                  <Checkbox
                    label="Prints upside-down"
                    checked={cfg.inverted}
                    onChange={v => setPanel(i, { inverted: v })}
                  />
                  <Checkbox
                    label="Tear-away (perforated stubs)"
                    checked={cfg.tearaway}
                    onChange={v => setPanel(i, { tearaway: v })}
                  />
                  {cfg.tearaway && (
                    <div className="flex items-center gap-xxs text-xs text-text-caption pl-5">
                      <span>Stubs</span>
                      <div className="w-20">
                        <NumberInput
                          value={cfg.tearawayCount}
                          onChange={v =>
                            setPanel(i, { tearawayCount: Math.max(1, v) })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
