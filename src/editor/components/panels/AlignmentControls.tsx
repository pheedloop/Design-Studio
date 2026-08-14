import { IconButton } from "../ui";
import { useT } from "../../i18n";
import type { CommonT } from "../../../i18n/types";
import {
  AlignLeftIcon,
  AlignCenterHIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignCenterVIcon,
  AlignBottomIcon,
  DistributeHIcon,
  DistributeVIcon,
} from "./alignmentIcons";

export interface AlignmentControlsProps {
  onAlignLeft?: () => void;
  onAlignCenterH?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignCenterV?: () => void;
  onAlignBottom?: () => void;
  onDistributeH?: () => void;
  onDistributeV?: () => void;
}

/**
 * The align + distribute icon cluster shared by the map editor's OptionsBar and
 * the badge editor. Renders a fragment (no wrapper) so it drops into an existing
 * `flex items-center gap-0.5` row; each button appears only when its handler is
 * provided. Distribute handlers are typically passed only with ≥3 units.
 */
export function AlignmentControls({
  onAlignLeft,
  onAlignCenterH,
  onAlignRight,
  onAlignTop,
  onAlignCenterV,
  onAlignBottom,
  onDistributeH,
  onDistributeV,
}: AlignmentControlsProps) {
  const t: CommonT = useT();

  return (
    <>
      {onAlignLeft && (
        <IconButton size="sm" title={t("common.align.left")} onClick={onAlignLeft}>
          <AlignLeftIcon />
        </IconButton>
      )}
      {onAlignCenterH && (
        <IconButton size="sm" title={t("common.align.centerH")} onClick={onAlignCenterH}>
          <AlignCenterHIcon />
        </IconButton>
      )}
      {onAlignRight && (
        <IconButton size="sm" title={t("common.align.right")} onClick={onAlignRight}>
          <AlignRightIcon />
        </IconButton>
      )}
      <div className="w-px h-3.5 bg-gray-200 shrink-0 mx-0.5" />
      {onAlignTop && (
        <IconButton size="sm" title={t("common.align.top")} onClick={onAlignTop}>
          <AlignTopIcon />
        </IconButton>
      )}
      {onAlignCenterV && (
        <IconButton size="sm" title={t("common.align.centerV")} onClick={onAlignCenterV}>
          <AlignCenterVIcon />
        </IconButton>
      )}
      {onAlignBottom && (
        <IconButton size="sm" title={t("common.align.bottom")} onClick={onAlignBottom}>
          <AlignBottomIcon />
        </IconButton>
      )}
      {(onDistributeH || onDistributeV) && (
        <div className="w-px h-3.5 bg-gray-200 shrink-0 mx-0.5" />
      )}
      {onDistributeH && (
        <IconButton size="sm" title={t("common.distribute.horizontal")} onClick={onDistributeH}>
          <DistributeHIcon />
        </IconButton>
      )}
      {onDistributeV && (
        <IconButton size="sm" title={t("common.distribute.vertical")} onClick={onDistributeV}>
          <DistributeVIcon />
        </IconButton>
      )}
    </>
  );
}
