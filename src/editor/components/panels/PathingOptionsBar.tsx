import { PiMagicWand, PiPath } from "react-icons/pi";
import { Button } from "@/components/Button";
import { Select, Slider } from "@/editor/components/ui";
import { useT } from "@/editor/i18n";
import { Row } from "@/components/Row";

interface PathingOptionsBarProps {
  cellSize: number;
  opacity: number;
  onCellSizeChange: (size: number) => void;
  onOpacityChange: (opacity: number) => void;
  onAutoMarkObstacles: () => void;
  onAutoMarkWalkable: () => void;
  onClearGrid: () => void;
}

const CELL_SIZE_OPTIONS = [10, 15, 20, 25, 30, 40];

export function PathingOptionsBar({
  cellSize,
  opacity,
  onCellSizeChange,
  onOpacityChange,
  onAutoMarkObstacles,
  onAutoMarkWalkable,
  onClearGrid,
}: PathingOptionsBarProps) {
  const t = useT();
  return (
    <Row
      gap="s"
      align="center"
      className="px-xs py-xxs bg-white border-b border-border-neutral-light"
    >
      <Row gap="tight" align="center">
        <span className="text-xs text-text-caption">
          {t("editor.field.cellSize")}
        </span>
        <Select
          value={cellSize}
          onChange={e => onCellSizeChange(Number(e.target.value))}
        >
          {CELL_SIZE_OPTIONS.map(s => (
            <option key={s} value={s}>
              {t("common.measurement", { value: s, unit: t("common.unit.px") })}
            </option>
          ))}
        </Select>
      </Row>

      <Row gap="tight" align="center">
        <span className="text-xs text-text-caption">
          {t("editor.field.opacity")}
        </span>
        <Slider
          min={0.1}
          max={0.8}
          step={0.05}
          value={opacity}
          onChange={e => onOpacityChange(Number(e.target.value))}
          className="w-16 h-1 accent-green-500"
        />
        <span className="text-xs text-text-subtle w-7">
          {Math.round(opacity * 100)}%
        </span>
      </Row>

      <div className="h-4 w-px bg-surface-muted" />

      <Button
        variant="ghost"
        color="positive"
        className="gap-xxxs"
        onClick={onAutoMarkWalkable}
        title={t("editor.pathing.autoAislesHint")}
      >
        <PiPath size={14} />
        {t("editor.pathing.autoAisles")}
      </Button>

      <button
        onClick={onAutoMarkObstacles}
        className="flex items-center gap-xxxs px-xxs py-xxxs text-xs text-text-body hover:bg-amber-50 hover:text-amber-700 rounded transition-colors cursor-pointer"
        title={t("editor.pathing.autoObstaclesHint")}
      >
        <PiMagicWand size={14} />
        {t("editor.pathing.autoObstacles")}
      </button>

      <div className="h-4 w-px bg-surface-muted" />

      <Button
        variant="ghost"
        color="negative"
        onClick={onClearGrid}
        title={t("editor.pathing.clearHint")}
      >
        {t("editor.pathing.clear")}
      </Button>
    </Row>
  );
}
