import { useT } from "@/editor/i18n";
import type { PlacementCategory } from "@/editor/placement/types";
import { PlacementRow } from "./PlacementRow";

export function PlacementRecordRow({
  category,
  record,
  isPlaced,
}: {
  category: PlacementCategory;
  record: unknown;
  isPlaced: boolean;
}) {
  const t = useT();
  const secondary = category.getSecondaryLabel?.(record);

  return (
    <PlacementRow
      isPlaced={isPlaced}
      recordType={category.elementType}
      recordId={category.getRecordId(record)}
    >
      <span className="flex-1 text-text-body truncate">
        {category.getPrimaryLabel(record)}
        {secondary && (
          <span className="text-text-subtle ml-xxxs text-xs">
            · {secondary}
          </span>
        )}
      </span>
      {isPlaced ? (
        <span className="shrink-0 text-xs font-medium text-green-600">
          {t("editor.placement.placed")}
        </span>
      ) : (
        <span className="shrink-0 text-xs font-medium text-amber-500">
          {t("editor.placement.unplaced")}
        </span>
      )}
    </PlacementRow>
  );
}
