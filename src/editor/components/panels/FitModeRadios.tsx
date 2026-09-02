import type { FitMode } from "@/editor/utils/dxf/bakeDrawing";
import type { T } from "@/editor/i18n";

export function FitModeRadios({
  mode,
  onChange,
  t,
}: {
  mode: FitMode;
  onChange: (mode: FitMode) => void;
  t: T;
}) {
  return (
    <div className="flex flex-col gap-xxs">
      <label className="flex items-center gap-xxs cursor-pointer">
        <input
          type="radio"
          name="bgSizeMode"
          checked={mode === "fit"}
          onChange={() => onChange("fit")}
          className="accent-primary-600"
        />
        <div>
          <span className="text-xs font-medium text-text-body">
            {t("editor.background.fitToCanvas")}
          </span>
          <p className="text-[11px] text-text-subtle">
            {t("editor.background.fitToCanvasHint")}
          </p>
        </div>
      </label>
      <label className="flex items-center gap-xxs cursor-pointer">
        <input
          type="radio"
          name="bgSizeMode"
          checked={mode === "resize"}
          onChange={() => onChange("resize")}
          className="accent-primary-600"
        />
        <div>
          <span className="text-xs font-medium text-text-body">
            {t("editor.background.resizeToFile")}
          </span>
          <p className="text-[11px] text-text-subtle">
            {t("editor.background.resizeToFileHint")}
          </p>
        </div>
      </label>
    </div>
  );
}
