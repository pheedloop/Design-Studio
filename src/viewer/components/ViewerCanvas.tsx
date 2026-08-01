import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import type { FloorPlanData } from "../../types";
import { useCanvasControls } from "../../editor/hooks/useCanvasControls";
import { isEmptySpaceClick } from "../../editor/utils/canvas";
import { BackgroundImage } from "../../editor/components/canvas/BackgroundImage";
import { DxfDrawing } from "../../editor/components/canvas/DxfDrawing";
import type { ViewerMode, HoveredItem } from "../types";
import { ViewerElement } from "./ViewerElement";
import { RouteOverlay } from "./RouteOverlay";
import { ScaleBar } from "./ScaleBar";
import { ViewerLegend } from "./ViewerLegend";
import { isViewerDebugEnabled } from "../utils/debug";

const SELECTED_BOOTH_COLOR = "#16a34a";
const RESERVED_BOOTH_COLOR = "#f59e0b";

interface ViewerCanvasProps {
  data: FloorPlanData;
  mode: ViewerMode;
  occupiedBoothSlugs: Set<string>;
  selectedBoothSlugs?: Set<string>;
  reservedBoothSlugs?: Set<string>;
  highlightedElementId: string | null;
  searchMatchIds: Set<string> | null;
  routePath: { x: number; y: number }[] | null;
  onElementClick: (item: HoveredItem, screenX: number, screenY: number) => void;
  onEmptySpaceClick?: () => void;
  onElementHover?: (
    item: HoveredItem | null,
    screenX: number,
    screenY: number,
  ) => void;
}

export function ViewerCanvas({ data, mode, occupiedBoothSlugs, selectedBoothSlugs, reservedBoothSlugs, highlightedElementId, searchMatchIds, routePath, onElementClick, onEmptySpaceClick, onElementHover }: ViewerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const isSearching = !!searchMatchIds && searchMatchIds.size > 0;
  const {
    stageRef,
    scale,
    position,
    stageSize,
    setStageSize,
    hasMeasured,
    fitToBounds,
    handleWheel,
    handleDragEnd,
    handleTouchMove,
    handleTouchEnd,
  } = useCanvasControls(containerRef);

  // Fit the whole plan in the viewport (centered, with a margin) rather than
  // pinning it to the top-left. useLayoutEffect so it's applied before the
  // browser paints (no zoom/pan flash).
  //
  // This re-runs while the stage is still resizing — inside a webview the
  // viewport settles after first paint (safe-area insets, the mobile sheet
  // mounting), and a fit computed against the earlier size leaves the plan
  // off-centre. It stops as soon as the user moves the view themselves.
  const hasMovedView = useRef(false);
  const markViewMoved = useCallback(() => {
    hasMovedView.current = true;
  }, []);

  // The canvas stays unmounted until the first fit has been applied, so the
  // opening frame is already centred. Rendering it beforehand paints the plan
  // at the default top-left origin and it visibly jumps into place.
  const [isFitted, setIsFitted] = useState(false);

  useLayoutEffect(() => {
    if (!hasMeasured || hasMovedView.current) return;

    // Re-measure here rather than trusting the observed size: the stage is sized
    // from `stageSize`, so fitting against anything else centres the plan for a
    // box that is not the one being painted. Sync the two first, then fit on the
    // following pass — both run before paint, so nothing is visible in between.
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      if (
        Math.round(rect.width) !== Math.round(stageSize.width) ||
        Math.round(rect.height) !== Math.round(stageSize.height)
      ) {
        setStageSize({ width: rect.width, height: rect.height });
        return;
      }
    }

    fitToBounds(
      { width: data.dimensions.width, height: data.dimensions.height },
      { padding: 48, maxScale: 1 },
    );
    setIsFitted(true);

    if (isViewerDebugEnabled()) {
      console.debug(
        `[viewerCanvas] fit into ${Math.round(stageSize.width)}x${Math.round(
          stageSize.height,
        )} for plan ${data.dimensions.width}x${data.dimensions.height}`,
      );
    }
  }, [
    hasMeasured,
    stageSize.width,
    stageSize.height,
    setStageSize,
    fitToBounds,
    data.dimensions.width,
    data.dimensions.height,
  ]);

  const sortedElements = [...data.elements].sort(
    (a, b) => (a.properties.zIndex ?? 0) - (b.properties.zIndex ?? 0)
  );

  const hasHighlight = highlightedElementId !== null;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-w-0 bg-gray-200 overflow-hidden"
      // Without this the browser claims the pinch and zooms the page instead.
      style={{ touchAction: "none" }}
    >
      {isFitted && (
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={(e) => {
          markViewMoved();
          handleWheel(e);
        }}
        onDragStart={markViewMoved}
        onDragEnd={handleDragEnd}
        onTouchMove={(e) => {
          if (e.evt.touches.length > 1) markViewMoved();
          handleTouchMove(e);
        }}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => {
          if (isEmptySpaceClick(e)) onEmptySpaceClick?.();
        }}
      >
        <Layer
          clip={{ x: 0, y: 0, width: data.dimensions.width, height: data.dimensions.height }}
        >
          <Rect
            id="background"
            x={0}
            y={0}
            width={data.dimensions.width}
            height={data.dimensions.height}
            fill="#ffffff"
            stroke="#d1d5db"
            strokeWidth={1}
          />
          {data.background?.kind === "image" && (
            <BackgroundImage config={data.background} />
          )}
          {data.background?.kind === "dxf" && <DxfDrawing config={data.background} />}
        </Layer>

        <Layer>
          {sortedElements.map((element) => {
            const isBooth = element.type === "booth";
            const isSessionArea = element.type === "session_area";
            const isMeetingRoom = element.type === "meeting_room";
            const isInteractive = isBooth || isSessionArea || isMeetingRoom;
            const boothSlug = element.properties.boothSlug ?? "";
            const isOccupied = isBooth && boothSlug ? occupiedBoothSlugs.has(boothSlug) : false;

            // In attendee mode, unoccupied booths are faded and non-interactive
            const isInert = mode === "attendee" && isBooth && !isOccupied;

            const isSelectedBooth = isBooth && !!boothSlug && !!selectedBoothSlugs?.has(boothSlug);
            const isReservedBooth = isBooth && !!boothSlug && !!reservedBoothSlugs?.has(boothSlug);

            const isSelected = element.id === highlightedElementId;
            const isSearchMatch = isInteractive && isSearching && searchMatchIds!.has(element.id);
            const isHovered = element.id === hoveredElementId;
            const highlighted = isSelected || !!isSearchMatch;
            const dimmed =
              !isSelectedBooth &&
              (isInert ||
                (mode === "exhibitor" && isBooth && isOccupied && !highlighted) ||
                (hasHighlight && !isSelected) ||
                (isSearching && !isSearchMatch && !isSelected));
            const overrideColor = isSelectedBooth
              ? SELECTED_BOOTH_COLOR
              : isReservedBooth
                ? RESERVED_BOOTH_COLOR
                : undefined;

            const buildClickItem = (): HoveredItem | null => {
              if (isBooth && boothSlug) {
                return { type: "booth", elementId: element.id, boothSlug };
              }
              if (isSessionArea) {
                return { type: "session_area", elementId: element.id, sessionId: element.properties.sessionId ?? null };
              }
              if (isMeetingRoom) {
                return { type: "meeting_room", elementId: element.id, meetingRoomId: element.properties.meetingRoomId ?? null };
              }
              return null;
            };

            return (
              <ViewerElement
                key={element.id}
                element={element}
                isHighlighted={highlighted}
                isDimmed={dimmed}
                overrideColor={overrideColor}
                isHovered={isHovered && !highlighted && !isInert}

                onMouseEnter={!isInert && isInteractive ? (e) => {
                  setHoveredElementId(element.id);
                  const item = buildClickItem();
                  if (item) onElementHover?.(item, e.screenX, e.screenY);
                } : undefined}
                onMouseLeave={!isInert && isInteractive ? () => {
                  setHoveredElementId(null);
                  onElementHover?.(null, 0, 0);
                } : undefined}
                onClick={!isInert && isInteractive ? (e) => {
                  const item = buildClickItem();
                  if (item) onElementClick(item, e.screenX, e.screenY);
                } : undefined}
              />
            );
          })}
        </Layer>

        {routePath && <RouteOverlay path={routePath} />}
      </Stage>
      )}
      {isFitted && <ScaleBar dimensions={data.dimensions} scale={scale} />}
      <ViewerLegend legend={data.legend} />
    </div>
  );
}
