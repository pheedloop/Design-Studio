import { Button } from "@/components/Button";
import { ColorSwatch, NumberInput } from "@/editor/components/ui";
import { Row } from "@/components/Row";
import { AlignmentControls } from "./AlignmentControls";
import type { OptionsBarField } from "@/editor/components/canvas/elements/types";
import { useT } from "@/editor/i18n";

export interface DrawingDefaults {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface OptionsBarProps {
  defaults: DrawingDefaults;
  config: { optionsBar: OptionsBarField[] };
  onDefaultsChange: (updates: Partial<DrawingDefaults>) => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onEnterGroup?: () => void;
  onExitGroup?: () => void;
  onAlignLeft?: () => void;
  onAlignCenterH?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignCenterV?: () => void;
  onAlignBottom?: () => void;
  onDistributeH?: () => void;
  onDistributeV?: () => void;
  onArrangeAsGrid?: () => void;
}

export function OptionsBar({
  defaults,
  config,
  onDefaultsChange,
  onGroup,
  onUngroup,
  onEnterGroup,
  onExitGroup,
  onAlignLeft,
  onAlignCenterH,
  onAlignRight,
  onAlignTop,
  onAlignCenterV,
  onAlignBottom,
  onDistributeH,
  onDistributeV,
  onArrangeAsGrid,
}: OptionsBarProps) {
  const t = useT();
  const fields = new Set<OptionsBarField>(config.optionsBar);
  const groupActions = [onGroup, onUngroup, onEnterGroup, onExitGroup].filter(
    Boolean,
  );
  const alignActions = [
    onAlignLeft,
    onAlignCenterH,
    onAlignRight,
    onAlignTop,
    onAlignCenterV,
    onAlignBottom,
    onDistributeH,
    onDistributeV,
    onArrangeAsGrid,
  ].filter(Boolean);

  return (
    <Row
      gap="s"
      align="center"
      className="px-xs py-xxs bg-white border-b border-border-neutral-light h-[43px]"
    >
      {fields.has("fill") && (
        <ColorSwatch
          label={t("editor.field.fill")}
          value={defaults.fill}
          onChange={fill => onDefaultsChange({ fill })}
        />
      )}
      {fields.has("stroke") && (
        <ColorSwatch
          label={t("editor.field.stroke")}
          value={defaults.stroke}
          onChange={stroke => onDefaultsChange({ stroke })}
        />
      )}
      {fields.has("strokeWidth") && (
        <Row gap="tight" align="center">
          <span className="text-xs text-text-caption">
            {t("editor.field.stroke")}
          </span>
          <div className="w-14">
            <NumberInput
              value={defaults.strokeWidth}
              onChange={strokeWidth =>
                onDefaultsChange({ strokeWidth: Math.max(0, strokeWidth) })
              }
            />
          </div>
        </Row>
      )}
      {groupActions.length > 0 && (
        <>
          <div className="w-px h-4 bg-surface-muted shrink-0" />
          <Row gap="xxxs" align="center">
            {onExitGroup && (
              <Button
                variant="outline"
                color="primary"
                size="sm"
                onClick={onExitGroup}
              >
                {t("editor.group.exit")}
              </Button>
            )}
            {onEnterGroup && (
              <Button
                variant="outline"
                color="neutral"
                size="sm"
                onClick={onEnterGroup}
              >
                {t("editor.group.enter")}
              </Button>
            )}
            {onUngroup && (
              <Button
                variant="outline"
                color="neutral"
                size="sm"
                onClick={onUngroup}
              >
                {t("editor.group.ungroup")}
              </Button>
            )}
            {onGroup && (
              <Button
                variant="outline"
                color="neutral"
                size="sm"
                onClick={onGroup}
              >
                {t("editor.group.group")}
              </Button>
            )}
          </Row>
        </>
      )}
      {alignActions.length > 0 && (
        <>
          <div className="w-px h-4 bg-surface-muted shrink-0" />
          <Row gap="hair" align="center">
            <AlignmentControls
              onAlignLeft={onAlignLeft}
              onAlignCenterH={onAlignCenterH}
              onAlignRight={onAlignRight}
              onAlignTop={onAlignTop}
              onAlignCenterV={onAlignCenterV}
              onAlignBottom={onAlignBottom}
              onDistributeH={onDistributeH}
              onDistributeV={onDistributeV}
            />
            {onArrangeAsGrid && (
              <>
                <div className="w-px h-3.5 bg-surface-muted shrink-0 mx-hair" />
                <Button
                  variant="outline"
                  color="neutral"
                  size="sm"
                  onClick={onArrangeAsGrid}
                >
                  {t("editor.field.grid")}
                </Button>
              </>
            )}
          </Row>
        </>
      )}
    </Row>
  );
}
