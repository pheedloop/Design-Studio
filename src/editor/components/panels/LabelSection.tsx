import type { ElementProperties } from "@/types";
import { Button } from "@/components/Button";
import {
  SectionLabel,
  NumberInput,
  ColorSwatch,
  Slider,
} from "@/editor/components/ui";
import { LabelPositionPicker } from "./LabelPositionPicker";
import { PiEye, PiEyeSlash } from "react-icons/pi";
import { useT } from "@/editor/i18n";

interface LabelSectionProps {
  properties: ElementProperties;
  onChange: (updates: Partial<ElementProperties>) => void;
}

export function LabelSection({ properties, onChange }: LabelSectionProps) {
  const t = useT();
  const visible = properties.labelVisible !== false;
  const hasBg = !!properties.labelBackground;

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between">
        <SectionLabel>{t("editor.field.label")}</SectionLabel>
        <button
          className={`p-1 rounded transition-colors cursor-pointer ${
            visible
              ? "text-text-caption hover:text-text-body"
              : "text-red-400 hover:text-red-600"
          }`}
          onClick={() => onChange({ labelVisible: !visible })}
          title={visible ? t("editor.label.hide") : t("editor.label.show")}
        >
          {visible ? <PiEye size={16} /> : <PiEyeSlash size={16} />}
        </button>
      </div>

      <LabelPositionPicker
        v={properties.labelPositionV}
        h={properties.labelPositionH}
        onChange={(v, h) => onChange({ labelPositionV: v, labelPositionH: h })}
      />

      <ColorSwatch
        label={t("editor.field.color")}
        value={properties.labelColor ?? "#ffffff"}
        onChange={c => onChange({ labelColor: c })}
      />

      <div className="flex flex-col gap-tight">
        <SectionLabel>{t("editor.field.fontSize")}</SectionLabel>
        <div className="w-20">
          <NumberInput
            value={properties.labelFontSize ?? 12}
            onChange={v => onChange({ labelFontSize: Math.max(6, v) })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-tight">
        <SectionLabel>{t("editor.field.style")}</SectionLabel>
        <div className="flex gap-xxxs">
          <Button
            variant="outline"
            color="neutral"
            active={properties.labelBold === true}
            className="w-8 h-8 p-0 font-bold"
            onClick={() => onChange({ labelBold: !properties.labelBold })}
          >
            B
          </Button>
          <Button
            variant="outline"
            color="neutral"
            active={properties.labelItalic === true}
            className="w-8 h-8 p-0 italic"
            onClick={() => onChange({ labelItalic: !properties.labelItalic })}
          >
            I
          </Button>
          <Button
            variant="outline"
            color="neutral"
            active={properties.labelUnderline === true}
            className="w-8 h-8 p-0 underline"
            onClick={() =>
              onChange({ labelUnderline: !properties.labelUnderline })
            }
          >
            U
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-tight">
        <div className="flex items-center gap-xxs">
          <SectionLabel>{t("editor.field.background")}</SectionLabel>
          <input
            type="checkbox"
            checked={hasBg}
            onChange={e => {
              if (e.target.checked) {
                onChange({
                  labelBackground: { color: "#000000", opacity: 0.5 },
                });
              } else {
                onChange({ labelBackground: undefined });
              }
            }}
            className="cursor-pointer"
          />
        </div>
        {hasBg && properties.labelBackground && (
          <div className="flex flex-col gap-xxs pl-1">
            <ColorSwatch
              label=""
              value={properties.labelBackground.color}
              onChange={c =>
                onChange({
                  labelBackground: { ...properties.labelBackground!, color: c },
                })
              }
            />
            <div className="flex items-center gap-tight">
              <span className="text-[11px] text-text-caption">
                {t("editor.field.opacity")}
              </span>
              <Slider
                min={0}
                max={100}
                value={Math.round(properties.labelBackground.opacity * 100)}
                onChange={e =>
                  onChange({
                    labelBackground: {
                      ...properties.labelBackground!,
                      opacity: Number(e.target.value) / 100,
                    },
                  })
                }
                className="flex-1"
              />
              <span className="text-[10px] text-text-subtle w-7 text-right">
                {Math.round(properties.labelBackground.opacity * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
