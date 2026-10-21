import type { FloorPlanElement } from "@/types";

// The elements a drag on `id` moves. Konva starts a drag before the click that
// would select the group, so a group member that isn't selected yet still has
// to move its whole group.
export function resolveDragSet(
  id: string,
  selectedIds: ReadonlySet<string>,
  elements: readonly FloorPlanElement[],
  activeGroupId: string | null,
): string[] {
  if (selectedIds.has(id)) return [...selectedIds];
  const groupId = elements.find(el => el.id === id)?.properties.groupId;
  if (groupId && groupId !== activeGroupId) {
    return elements
      .filter(el => el.properties.groupId === groupId)
      .map(el => el.id);
  }
  return [id];
}
