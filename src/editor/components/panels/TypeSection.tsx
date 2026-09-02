import { useState } from "react";
import type { ElementProperties, ElementTypeDefaults } from "@/types";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import { useT } from "@/editor/i18n";
import {
  ColorSwatch,
  NumberInput,
  SectionLabel,
  Slider,
} from "@/editor/components/ui";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { GRAY_400 } from "@/canvasColors";
import { LabelSection } from "./LabelSection";

const TYPE_DISPLAY_NAMES: Record<string, string> = {
  booth: "Booth",
  session_area: "Session Location",
  meeting_room: "Meeting Room",
};

function formatTypeDisplayName(key: string): string {
  if (TYPE_DISPLAY_NAMES[key]) return TYPE_DISPLAY_NAMES[key];
  return key
    .split(/[_-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toElementProperties(defaults: ElementTypeDefaults): ElementProperties {
  return {
    color: defaults.color ?? GRAY_400,
    zIndex: 1,
    labelColor: defaults.labelColor,
    labelFontSize: defaults.labelFontSize,
    labelBold: defaults.labelBold,
    labelItalic: defaults.labelItalic,
    labelUnderline: defaults.labelUnderline,
    labelBackground: defaults.labelBackground,
    labelVisible: defaults.labelVisible,
    labelPositionV: defaults.labelPositionV,
    labelPositionH: defaults.labelPositionH,
  };
}

interface TypeSectionProps {
  typeKey: string;
  defaults: ElementTypeDefaults;
  onChange: (updates: Partial<ElementTypeDefaults>) => void;
}

export function TypeSection({ typeKey, defaults, onChange }: TypeSectionProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const opacity = defaults.opacity ?? 1;

  return (
    <div className="border border-border-neutral-light rounded">
      <button
        className="w-full flex items-center justify-between px-xs py-xxs text-left hover:bg-surface-neutral transition-colors cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <Row gap="xxs" align="center">
          <span
            className="w-3 h-3 rounded-sm shrink-0 border border-border-neutral"
            style={{ background: defaults.color ?? GRAY_400 }}
          />
          <Text size="xs" weight="medium" color="body" as="span">
            {formatTypeDisplayName(typeKey)}
          </Text>
        </Row>
        {open ? (
          <PiCaretDown size={12} className="text-text-subtle" />
        ) : (
          <PiCaretRight size={12} className="text-text-subtle" />
        )}
      </button>

      {open && (
        <Stack
          gap="xs"
          className="px-xs pb-xs border-t border-border-neutral-faint pt-xs"
        >
          <ColorSwatch
            label={t("editor.field.fill")}
            value={defaults.color ?? GRAY_400}
            onChange={c => onChange({ color: c })}
          />
          <ColorSwatch
            label={t("editor.field.stroke")}
            value={defaults.strokeColor ?? GRAY_400}
            onChange={c => onChange({ strokeColor: c })}
          />
          <Stack gap="tight">
            <SectionLabel>{t("editor.field.strokeWidth")}</SectionLabel>
            <div className="w-20">
              <NumberInput
                value={defaults.strokeWidth ?? 1}
                onChange={v => onChange({ strokeWidth: Math.max(0, v) })}
              />
            </div>
          </Stack>
          <Row gap="xs">
            <Stack gap="tight" className="flex-1">
              <SectionLabel>{t("editor.field.defaultWidth")}</SectionLabel>
              <NumberInput
                value={defaults.defaultWidth ?? 120}
                onChange={v => onChange({ defaultWidth: Math.max(1, v) })}
              />
            </Stack>
            <Stack gap="tight" className="flex-1">
              <SectionLabel>{t("editor.field.defaultHeight")}</SectionLabel>
              <NumberInput
                value={defaults.defaultHeight ?? 80}
                onChange={v => onChange({ defaultHeight: Math.max(1, v) })}
              />
            </Stack>
          </Row>
          <Stack gap="tight">
            <Row align="center" justify="between">
              <SectionLabel>{t("editor.field.opacity")}</SectionLabel>
              <span className="text-xs text-text-subtle">
                {Math.round(opacity * 100)}%
              </span>
            </Row>
            <Slider
              min={0}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={e =>
                onChange({ opacity: Number(e.target.value) / 100 })
              }
              className="w-full"
            />
          </Stack>
          <div className="border-t border-border-neutral-faint pt-xs">
            <LabelSection
              properties={toElementProperties(defaults)}
              onChange={updates =>
                onChange(updates as Partial<ElementTypeDefaults>)
              }
            />
          </div>
        </Stack>
      )}
    </div>
  );
}
