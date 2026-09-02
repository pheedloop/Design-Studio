import { SectionLabel } from "@/editor/components/ui";
import { useT } from "@/editor/i18n";

type VPos = "top" | "middle" | "bottom";
type HPos = "left" | "center" | "right";

interface LabelPositionPickerProps {
  v?: VPos;
  h?: HPos;
  onChange: (v: VPos, h: HPos) => void;
}

const vValues: VPos[] = ["top", "middle", "bottom"];
const hValues: HPos[] = ["left", "center", "right"];

export function LabelPositionPicker({
  v,
  h,
  onChange,
}: LabelPositionPickerProps) {
  const t = useT();
  return (
    <div className="flex flex-col gap-xxxs.5">
      <SectionLabel>{t("editor.field.labelPosition")}</SectionLabel>
      <div className="inline-grid grid-cols-3 gap-xxxs p-1.5 bg-surface-neutral rounded border border-border-neutral-light w-fit">
        {vValues.map(vv =>
          hValues.map(hh => {
            const active = vv === v && hh === h;
            return (
              <button
                key={`${vv}-${hh}`}
                className={`w-5 h-5 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                  active
                    ? "bg-blue-500"
                    : "bg-surface-muted hover:bg-surface-muted-hover"
                }`}
                onClick={() => onChange(vv, hh)}
                title={`${vv}-${hh}`}
              >
                <span
                  className={`block w-1.5 h-1.5 rounded-full ${
                    active ? "bg-white" : "bg-gray-400"
                  }`}
                />
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
