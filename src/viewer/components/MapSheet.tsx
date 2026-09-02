import { useState, useMemo } from "react";
import { PiCaretUp, PiCaretDown } from "react-icons/pi";
import type { FloorPlanElement } from "@/types";
import type { Exhibitor, HoveredItem } from "@/viewer/types";
import { useT } from "@/viewer/i18n";
import { Row } from "@/components/Row";
import { Text } from "@/components/Text";

interface MapSheetProps {
  elements: FloorPlanElement[];
  exhibitors: Exhibitor[];
  selectedItem: HoveredItem | null;
  onSelect: (item: HoveredItem) => void;
}

type TabId = "exhibitors" | "sessions" | "meetingRooms";

export function MapSheet({
  elements,
  exhibitors,
  selectedItem,
  onSelect,
}: MapSheetProps) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);

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
            label: t("viewer.tab.rooms"),
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
  const hasTabs = visibleTabs.length > 1;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 z-50"
      style={{ maxHeight: expanded ? "60%" : hasTabs ? 56 : 48 }}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={
            expanded ? t("viewer.sheet.collapse") : t("viewer.sheet.expand")
          }
          className="absolute inset-0 w-full cursor-pointer"
        />
        <div className="relative flex items-center justify-between w-full px-4 py-3 pointer-events-none">
          {hasTabs ? (
            <Row gap="xs" className="pointer-events-auto">
              {visibleTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setExpanded(true);
                  }}
                  className={`text-xs font-medium pb-0.5 cursor-pointer transition-colors ${
                    currentTab === tab.id
                      ? "text-primary-600 border-b-2 border-primary-500"
                      : "text-text-subtle hover:text-text-body"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </Row>
          ) : (
            <Text size="xs" weight="medium" color="body" as="span">
              {t("viewer.labelWithCount", {
                label: visibleTabs[0]?.label ?? "",
                count: visibleTabs[0]?.count ?? 0,
              })}
            </Text>
          )}
          {expanded ? (
            <PiCaretDown size={14} className="text-text-subtle" />
          ) : (
            <PiCaretUp size={14} className="text-text-subtle" />
          )}
        </div>
      </div>

      {expanded && (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(60vh - 56px)" }}
        >
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
                  className={`w-full text-left px-4 py-2.5 border-t border-border-neutral-faint cursor-pointer transition-colors ${
                    isSelected ? "bg-primary-100" : "hover:bg-surface-neutral"
                  }`}
                >
                  <Row gap="xxs" align="center">
                    {exhibitor.logo && (
                      <img
                        src={exhibitor.logo}
                        alt=""
                        className="w-7 h-7 shrink-0 rounded-md border border-border-neutral-light bg-white object-contain p-0.5"
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
                  className={`w-full text-left px-4 py-2.5 border-t border-border-neutral-faint cursor-pointer transition-colors ${
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
                  className={`w-full text-left px-4 py-2.5 border-t border-border-neutral-faint cursor-pointer transition-colors ${
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
      )}
    </div>
  );
}
