import type { Exhibitor } from "@/viewer/types";
import { Stack } from "@/components/Stack";
import { Popover } from "./Popover";
import { ExhibitorLogo } from "./ExhibitorLogo";
import { useT } from "@/viewer/i18n";

interface BoothPopoverProps {
  boothCode: string;
  exhibitor: Exhibitor | null;
  x: number;
  y: number;
  onClose: () => void;
  onGetDirections?: () => void;
  /** When provided, the exhibitor card becomes a clickable link to the
   *  exhibitor (e.g. the host app navigates to the exhibitor profile). */
  onExhibitorClick?: (exhibitor: Exhibitor) => void;
}

export function BoothPopover({
  boothCode,
  exhibitor,
  x,
  y,
  onClose,
  onGetDirections,
  onExhibitorClick,
}: BoothPopoverProps) {
  const t = useT();

  return (
    <Popover x={x} y={y} onClose={onClose}>
      <div className="text-center text-xs font-medium text-text-subtle">
        {boothCode}
      </div>
      {exhibitor ? (
        onExhibitorClick ? (
          <button
            type="button"
            onClick={() => onExhibitorClick(exhibitor)}
            className="mt-xxxs flex w-full flex-col items-center gap-xxs rounded-md px-xxs py-xxs text-center hover:bg-surface-neutral cursor-pointer transition-colors"
          >
            <ExhibitorLogo exhibitor={exhibitor} />
            <div className="text-sm font-medium text-text-heading line-clamp-2">
              {exhibitor.name}
            </div>
          </button>
        ) : (
          <Stack gap="xxs" align="center" className="mt-xxxs text-center">
            <ExhibitorLogo exhibitor={exhibitor} />
            <div className="text-sm font-medium text-text-heading line-clamp-2">
              {exhibitor.name}
            </div>
          </Stack>
        )
      ) : (
        <div className="mt-xxxs text-center text-xs text-text-subtle">
          {t("viewer.booth.noExhibitor")}
        </div>
      )}
      {onGetDirections && (
        <button
          onClick={() => onGetDirections()}
          className="mt-xxs w-full text-xs font-medium text-blue-600 hover:bg-blue-50 rounded px-xxs py-tight cursor-pointer transition-colors text-left"
        >
          {t("viewer.getDirections")}
        </button>
      )}
    </Popover>
  );
}
