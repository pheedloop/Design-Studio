import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect } from "react-konva";
import type { FloorPlanData } from "../../types";
import { useCanvasControls } from "../../editor/hooks/useCanvasControls";
import { BackgroundImage } from "../../editor/components/canvas/BackgroundImage";
import { DxfDrawing } from "../../editor/components/canvas/DxfDrawing";
import { ViewerElement } from "../../viewer/components/ViewerElement";
import { I18nProvider } from "../../i18n/context";
import type { Translate } from "../../i18n/types";

export interface SeatPlanCanvasProps {
  data: FloorPlanData;
  /**
   * Fill color for a table, keyed by its `properties.tableCode`. Return undefined
   * to fall back to the element's own color. Typically an occupancy color.
   */
  getTableColor?: (tableCode: string) => string | undefined;
  /** Table (by code) drawn with selection emphasis. */
  highlightedTableCode?: string | null;
  /** Tables (by code) de-emphasized — e.g. not eligible for the current selection. */
  dimmedTableCodes?: ReadonlySet<string> | null;
  /** Fired when an interactive table is clicked. */
  onTableClick?: (tableCode: string) => void;
  /** Fired when empty canvas (anything other than an interactive table) is clicked. */
  onBackgroundClick?: () => void;
  /** Overlay content positioned within the canvas region (e.g. the table dialog). */
  children?: ReactNode;
  /**
   * Resolves this canvas's own UI strings. Omit for built-in English.
   *
   * Present because the canvas is published separately and a host may mount it
   * without SeatPlanViewer. Nested inside SeatPlanViewer, leaving it undefined
   * inherits that viewer's translator rather than resetting to English.
   */
  translate?: Translate;
  /** BCP-47 tag for number and list formatting. Inherits when omitted. */
  locale?: string;
}

/**
 * Read-only Konva canvas for seat plans. Renders a FloorPlanData and makes
 * `type: "table"` elements interactive (occupancy fill, dim, select, click).
 * Non-table elements render as static context. Reuses the shared ViewerElement
 * renderer and the editor's pan/zoom controls.
 */
export function SeatPlanCanvas({
  translate,
  locale,
  ...rest
}: SeatPlanCanvasProps) {
  return (
    <I18nProvider translate={translate} locale={locale}>
      <SeatPlanCanvasInner {...rest} />
    </I18nProvider>
  );
}

function SeatPlanCanvasInner({
  data,
  getTableColor,
  highlightedTableCode,
  dimmedTableCodes,
  onTableClick,
  onBackgroundClick,
  children,
}: Omit<SeatPlanCanvasProps, "translate" | "locale">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTableCode, setHoveredTableCode] = useState<string | null>(null);
  const {
    stageRef,
    scale,
    position,
    stageSize,
    hasMeasured,
    fitToBounds,
    handleWheel,
    handleDragEnd,
  } = useCanvasControls(containerRef);

  // useLayoutEffect so the fit lands before paint; useEffect flashes.
  const userAdjusted = useRef(false);
  useLayoutEffect(() => {
    if (!hasMeasured || userAdjusted.current) return;
    fitToBounds(
      { width: data.dimensions.width, height: data.dimensions.height },
      { padding: 48, maxScale: 1 },
    );
  }, [
    hasMeasured,
    stageSize.width,
    stageSize.height,
    fitToBounds,
    data.dimensions.width,
    data.dimensions.height,
  ]);

  const onWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      userAdjusted.current = true;
      handleWheel(e);
    },
    [handleWheel],
  );

  const onDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      userAdjusted.current = true;
      handleDragEnd(e);
    },
    [handleDragEnd],
  );

  const sortedElements = [...data.elements].sort(
    (a, b) => (a.properties.zIndex ?? 0) - (b.properties.zIndex ?? 0)
  );

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 bg-gray-200 overflow-hidden">
      {/* Absolute so the Stage's own pixel size can't grow the box we measure. */}
      <Stage
        className="absolute inset-0"
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={onWheel}
        onDragEnd={onDragEnd}
        onClick={() => onBackgroundClick?.()}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={data.dimensions.width}
            height={data.dimensions.height}
            fill="#ffffff"
            stroke="#d1d5db"
            strokeWidth={1}
          />
          {data.background?.kind === "image" && <BackgroundImage config={data.background} />}
          {data.background?.kind === "dxf" && <DxfDrawing config={data.background} />}
        </Layer>

        <Layer>
          {sortedElements.map((element) => {
            const isTable = element.type === "table";
            const tableCode = element.properties.tableCode ?? null;
            const interactive = isTable && !!tableCode;

            const overrideColor =
              interactive && getTableColor ? getTableColor(tableCode!) : undefined;
            const isHighlighted = interactive && tableCode === highlightedTableCode;
            const isDimmed = interactive && !!dimmedTableCodes?.has(tableCode!);
            const isHovered = interactive && tableCode === hoveredTableCode;

            return (
              <ViewerElement
                key={element.id}
                element={element}
                isHighlighted={!!isHighlighted}
                isDimmed={isDimmed}
                isHovered={!!isHovered && !isHighlighted}
                overrideColor={overrideColor}
                onMouseEnter={interactive ? () => setHoveredTableCode(tableCode) : undefined}
                onMouseLeave={interactive ? () => setHoveredTableCode(null) : undefined}
                onClick={
                  interactive && onTableClick ? () => onTableClick(tableCode!) : undefined
                }
              />
            );
          })}
        </Layer>
      </Stage>
      {children}
    </div>
  );
}
