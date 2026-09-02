import type { FitMode } from "@/editor/utils/dxf/bakeDrawing";
import type { T } from "@/editor/i18n";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";

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
    <Stack gap="xxs">
      <label className="flex items-center gap-xxs cursor-pointer">
        <input
          type="radio"
          name="bgSizeMode"
          checked={mode === "fit"}
          onChange={() => onChange("fit")}
          className="accent-primary-600"
        />
        <div>
          <Text size="xs" weight="medium" color="body" as="span">
            {t("editor.background.fitToCanvas")}
          </Text>
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
          <Text size="xs" weight="medium" color="body" as="span">
            {t("editor.background.resizeToFile")}
          </Text>
          <p className="text-[11px] text-text-subtle">
            {t("editor.background.resizeToFileHint")}
          </p>
        </div>
      </label>
    </Stack>
  );
}
