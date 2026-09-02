import type { Legend } from "@/types";
import { useT } from "@/editor/i18n";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";

interface LegendCanvasOverlayProps {
  legend: Legend;
}

export function LegendCanvasOverlay({ legend }: LegendCanvasOverlayProps) {
  const t = useT();
  const visibleEntries = legend.entries.filter(e => e.visible);

  if (!legend.visible || visibleEntries.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10 pointer-events-none select-none">
      <Stack
        gap="tight"
        className="bg-white border border-border-neutral-light rounded shadow-sm px-3 py-2"
      >
        {visibleEntries.map(entry => (
          <Row key={entry.id} gap="xxs" align="center">
            <span
              className="shrink-0 rounded-sm border border-border-neutral"
              style={{ width: 12, height: 12, background: entry.color }}
            />
            <span className="text-xs text-text-body leading-none">
              {entry.label || (
                <em className="text-text-subtle">{t("common.unlabeled")}</em>
              )}
            </span>
          </Row>
        ))}
      </Stack>
    </div>
  );
}
