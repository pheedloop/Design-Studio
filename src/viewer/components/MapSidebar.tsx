import { useMemo, useState } from "react";
import type { FloorPlanElement } from "@/types";
import { useT } from "@/viewer/i18n";
import type { Exhibitor, HoveredItem } from "@/viewer/types";
import { Row } from "@/components/Row";
import { Text } from "@/components/Text";

interface MapSidebarProps {
  elements: FloorPlanElement[];
  exhibitors: Exhibitor[];
  selectedItem: HoveredItem | null;
  onSelect: (item: HoveredItem) => void;
}

type TabId = "exhibitors" | "sessions" | "meetingRooms";

export function MapSidebar({
  elements,
  exhibitors,
  selectedItem,
  onSelect,
}: MapSidebarProps) {
  const t = useT();
  const sessionElements = useMemo(
    () =>
      [...elements.filter(el => el.type === "session_area")].sort((a, b) =>
        (a.properties.name || "").localeCompare(b.properties.name || ""),
      ),
    [elements],
  );

  const meetingRoomElements = useMemo(
    () =>
      [...elements.filter(el => el.type === "meeting_room")].sort((a, b) =>
        (a.properties.name || "").localeCompare(b.properties.name || ""),
      ),
    [elements],
  );

  const sortedExhibitors = useMemo(
    () => [...exhibitors].sort((a, b) => a.name.localeCompare(b.name)),
    [exhibitors],
  );

  const boothBySlug = useMemo(() => {
    const map = new Map<string, FloorPlanElement>();
    for (const el of elements) {
      if (el.type === "booth" && el.properties.boothSlug) {
        map.set(el.properties.boothSlug, el);
      }
    }
    return map;
  }, [elements]);

  const visibleTabs = useMemo(
    () =>
      (
        [
          {
            id: "exhibitors" as TabId,
            label: t("viewer.tab.exhibitors"),
            count: exhibitors.length,
          },
          {
            id: "sessions" as TabId,
            label: t("viewer.tab.sessions"),
            count: sessionElements.length,
          },
          {
            id: "meetingRooms" as TabId,
            label: t("viewer.tab.meetingRooms"),
            count: meetingRoomElements.length,
          },
        ] as const
      ).filter(tab => tab.count > 0),
    [exhibitors.length, sessionElements.length, meetingRoomElements.length, t],
  );

  const [activeTab, setActiveTab] = useState<TabId>(
    () => visibleTabs[0]?.id ?? "exhibitors",
  );

  const currentTab = visibleTabs.some(t => t.id === activeTab)
    ? activeTab
    : (visibleTabs[0]?.id ?? "exhibitors");

  return (
    <div className="w-64 shrink-0 bg-white border-l border-border-neutral-light flex flex-col">
      {/* Tab bar — only shown when there are multiple tabs */}
      {visibleTabs.length > 1 && (
        <div className="flex border-b border-border-neutral-light">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-xxs py-xxs text-[11px] font-medium transition-colors cursor-pointer ${
                currentTab === tab.id
                  ? "text-primary-600 border-b-2 border-primary-500"
                  : "text-text-caption hover:text-text-body"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Single tab header — mirrors original ExhibitorList when no tabs needed */}
      {visibleTabs.length === 1 && (
        <div className="px-xs py-xxs border-b border-border-neutral-light">
          <Text size="xs" weight="medium" color="body" as="span">
            {t("viewer.labelWithCount", {
              label: visibleTabs[0].label,
              count: visibleTabs[0].count,
            })}
          </Text>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {currentTab === "exhibitors" &&
          sortedExhibitors.map(exhibitor => {
            const boothEl = boothBySlug.get(exhibitor.boothSlug);
            const isSelected = boothEl
              ? selectedItem?.elementId === boothEl.id
              : false;
            return (
              <button
                key={exhibitor.id}
                onClick={() => {
                  if (!boothEl) return;
                  onSelect({
                    type: "booth",
                    elementId: boothEl.id,
                    boothSlug: exhibitor.boothSlug,
                  });
                }}
                className={`w-full text-left px-xs py-xxs border-b border-border-neutral-faint cursor-pointer transition-colors ${
                  isSelected ? "bg-primary-100" : "hover:bg-surface-neutral"
                }`}
              >
                <Row gap="xxs" align="center">
                  {exhibitor.logo && (
                    <img
                      src={exhibitor.logo}
                      alt=""
                      className="w-7 h-7 shrink-0 rounded-md border border-border-neutral-light bg-white object-contain p-hair"
                    />
                  )}
                  <div>
                    <div className="text-xs font-medium text-text-heading">
                      {exhibitor.name}
                    </div>
                    <div className="text-[11px] text-text-subtle">
                      {boothEl?.properties.name
                        ? t("viewer.boothLabel", {
                            code: boothEl.properties.name,
                          })
                        : ""}
                    </div>
                  </div>
                </Row>
              </button>
            );
          })}

        {currentTab === "sessions" &&
          sessionElements.map(el => {
            const isSelected = selectedItem?.elementId === el.id;
            return (
              <button
                key={el.id}
                onClick={() =>
                  onSelect({
                    type: "session_area",
                    elementId: el.id,
                    sessionId: el.properties.sessionId ?? null,
                  })
                }
                className={`w-full text-left px-xs py-xxs border-b border-border-neutral-faint cursor-pointer transition-colors ${
                  isSelected ? "bg-primary-100" : "hover:bg-surface-neutral"
                }`}
              >
                <div className="text-xs font-medium text-text-heading">
                  {el.properties.name || t("viewer.unnamedSession")}
                </div>
              </button>
            );
          })}

        {currentTab === "meetingRooms" &&
          meetingRoomElements.map(el => {
            const isSelected = selectedItem?.elementId === el.id;
            return (
              <button
                key={el.id}
                onClick={() =>
                  onSelect({
                    type: "meeting_room",
                    elementId: el.id,
                    meetingRoomId: el.properties.meetingRoomId ?? null,
                  })
                }
                className={`w-full text-left px-xs py-xxs border-b border-border-neutral-faint cursor-pointer transition-colors ${
                  isSelected ? "bg-primary-100" : "hover:bg-surface-neutral"
                }`}
              >
                <div className="text-xs font-medium text-text-heading">
                  {el.properties.name || t("viewer.unnamedRoom")}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
