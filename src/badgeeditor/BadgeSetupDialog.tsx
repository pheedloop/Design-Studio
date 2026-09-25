import { useState } from "react";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import {
  Dialog,
  NumberInput,
  SectionLabel,
  Select,
} from "@/editor/components/ui";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { UNIT_LABEL_KEYS, UNIT_NAME_KEYS, formatDim, type Unit } from "./units";
import {
  PAGE_COUNT,
  pageRoleForIndex,
  pageRoleLabel,
  type BadgePage,
  type BadgePreset,
  type FoldType,
  type HolePunch,
} from "./model";
import { foldInvertForPage } from "./serialize";
import { presetSetup } from "./presets";
import {
  DEFAULT_TEARAWAYS,
  type BadgeSetup,
  type PanelConfig,
} from "./badgeSetup";
import { DimField } from "./DimField";
import { useLocale, useT, type StringKey } from "./i18n";

const FOLD_OPTIONS: { value: FoldType; labelKey: StringKey }[] = [
  { value: "none", labelKey: "badgeeditor.setup.foldNone" },
  { value: "single", labelKey: "badgeeditor.setup.foldSingle" },
  { value: "double", labelKey: "badgeeditor.setup.foldDouble" },
];

interface BadgeSetupDialogProps {
  fold: FoldType;
  panelSize: { width: number; height: number };
  pages: BadgePage[];
  holePunch: HolePunch | null;
  cornerRadiusMm: number;
  presets: BadgePreset[];
  /** Display/input unit. Panel sizes are stored in inches regardless. */
  unit: Unit;
  /** Change the editor's measurement unit (applies live). */
  onUnitChange: (unit: Unit) => void;
  onApply: (setup: BadgeSetup) => void;
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
  holePunch,
  cornerRadiusMm,
  presets,
  unit,
  onUnitChange,
  onApply,
  onClose,
}: BadgeSetupDialogProps) {
  const t = useT();
  const locale = useLocale();
  const [localFold, setLocalFold] = useState<FoldType>(fold);
  const [w, setW] = useState(panelSize.width);
  const [h, setH] = useState(panelSize.height);
  const [localHolePunch, setLocalHolePunch] = useState(holePunch);
  const [localRadius, setLocalRadius] = useState(cornerRadiusMm);
  const [presetKey, setPresetKey] = useState("");
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

  const applyPreset = (key: string) => {
    const preset = presets.find(p => p.key === key);
    if (!preset) return;
    const setup = presetSetup(preset);
    setPresetKey(key);
    changeFold(setup.fold);
    setW(setup.panelSize.width);
    setH(setup.panelSize.height);
    setLocalHolePunch(setup.holePunch);
    setLocalRadius(setup.cornerRadiusMm);
  };

  const leavePreset = () => {
    if (!presetKey) return;
    setPresetKey("");
    setLocalHolePunch(holePunch);
    setLocalRadius(cornerRadiusMm);
  };

  const unitLabel = t(UNIT_LABEL_KEYS[unit]);
  const printsAs = {
    width: formatDim(w, unit, locale),
    height: formatDim(h * count, unit, locale),
    unit: unitLabel,
  };

  const setPanel = (i: number, patch: Partial<PanelConfig>) =>
    setPanels(prev => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <Dialog
      title={t("badgeeditor.setup.title")}
      onClose={onClose}
      width="400px"
      footer={
        <>
          <Button variant="outline" color="neutral" onClick={onClose}>
            {t("badgeeditor.setup.cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onClick={() => {
              onApply({
                fold: localFold,
                panelSize: { width: w, height: h },
                panels,
                holePunch: localHolePunch,
                cornerRadiusMm: localRadius,
              });
              onClose();
            }}
          >
            {t("badgeeditor.setup.apply")}
          </Button>
        </>
      }
    >
      <Stack gap="s" className="p-s">
        {presets.length > 0 && (
          <Stack gap="tight">
            <SectionLabel>{t("badgeeditor.setup.presets")}</SectionLabel>
            <Select
              value={presetKey}
              onChange={e => applyPreset(e.target.value)}
            >
              <option value="" disabled>
                {t("badgeeditor.setup.presetPlaceholder")}
              </option>
              {presets.map(p => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Stack>
        )}

        <Stack gap="tight">
          <SectionLabel>{t("badgeeditor.setup.fold")}</SectionLabel>
          <Row gap="xxs">
            {FOLD_OPTIONS.map(o => (
              <Button
                key={o.value}
                variant="outline"
                color={localFold === o.value ? "primary" : "neutral"}
                active={localFold === o.value}
                className="flex-1"
                onClick={() => {
                  leavePreset();
                  changeFold(o.value);
                }}
              >
                {t(o.labelKey)}
              </Button>
            ))}
          </Row>
          <span className="text-xs text-text-subtle">
            {t("badgeeditor.setup.panelCount", { count })}
          </span>
        </Stack>

        <Stack gap="tight">
          <SectionLabel>{t("badgeeditor.setup.units")}</SectionLabel>
          <Row gap="xxs">
            {(["in", "cm"] as Unit[]).map(u => (
              <Button
                key={u}
                variant="outline"
                color={unit === u ? "primary" : "neutral"}
                active={unit === u}
                className="flex-1"
                onClick={() => onUnitChange(u)}
              >
                {t(UNIT_NAME_KEYS[u])}
              </Button>
            ))}
          </Row>
        </Stack>

        <Row gap="xs">
          <DimField
            label={t("badgeeditor.setup.panelWidth", { unit: unitLabel })}
            value={w}
            unit={unit}
            onChange={v => {
              leavePreset();
              setW(v);
            }}
          />
          <DimField
            label={t("badgeeditor.setup.panelHeight", { unit: unitLabel })}
            value={h}
            unit={unit}
            onChange={v => {
              leavePreset();
              setH(v);
            }}
          />
        </Row>

        <div className="text-xs text-text-caption">
          {localFold !== "none"
            ? t("badgeeditor.setup.printsAsUnfolded", printsAs)
            : t("badgeeditor.setup.printsAs", printsAs)}
        </div>

        {count > 1 && (
          <Stack gap="tight">
            <SectionLabel>{t("badgeeditor.setup.panels")}</SectionLabel>
            <Stack gap="tight">
              {panels.map((cfg, i) => (
                <Stack
                  key={i}
                  gap="tight"
                  className="px-snug py-xxs rounded border border-border-neutral-light"
                >
                  <Text size="xs" weight="medium" color="body" as="span">
                    {pageRoleLabel(pageRoleForIndex(count, i), t)}
                  </Text>
                  <Checkbox
                    label={t("badgeeditor.setup.printsUpsideDown")}
                    checked={cfg.inverted}
                    onChange={v => setPanel(i, { inverted: v })}
                  />
                  <Checkbox
                    label={t("badgeeditor.setup.tearaway")}
                    checked={cfg.tearaway}
                    onChange={v => setPanel(i, { tearaway: v })}
                  />
                  {cfg.tearaway && (
                    <Row
                      gap="xxs"
                      align="center"
                      className="text-xs text-text-caption pl-5"
                    >
                      <span>{t("badgeeditor.setup.stubs")}</span>
                      <div className="w-20">
                        <NumberInput
                          value={cfg.tearawayCount}
                          onChange={v =>
                            setPanel(i, { tearawayCount: Math.max(1, v) })
                          }
                        />
                      </div>
                    </Row>
                  )}
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
}
