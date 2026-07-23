export type Unit = "ft" | "m" | "px";

// --- Layer system ---

export type LayerId = "background" | "content" | "pathing" | "markup";

export interface LayerDefinition {
  id: LayerId;
  name: string;
  order: number;
  visible: boolean;
  /** Whether this layer accepts arbitrary elements (false = special-purpose layer) */
  special: boolean;
}

export const DEFAULT_LAYERS: LayerDefinition[] = [
  { id: "background", name: "Background", order: 0, visible: true, special: true },
  { id: "content", name: "Content", order: 1, visible: true, special: false },
  { id: "pathing", name: "Pathing", order: 2, visible: true, special: true },
  { id: "markup", name: "Markup", order: 3, visible: true, special: false },
];

// --- Element types ---

export type ElementType =
  | "booth"
  | "session_area"
  | "meeting_room"
  | "table"
  | "stage"
  | "walkway"
  | "wall"
  | "label"
  | "icon"
  | "shape";

/** Default layer assignment per element type. Elements can be moved to other non-special layers. */
export const ELEMENT_TYPE_TO_LAYER: Record<ElementType, LayerId> = {
  booth: "content",
  session_area: "content",
  meeting_room: "content",
  table: "content",
  stage: "content",
  walkway: "pathing",
  wall: "pathing",
  label: "markup",
  icon: "markup",
  shape: "markup",
};

export type ShapeType = "rect" | "polygon" | "circle" | "ellipse";

export interface Point {
  x: number;
  y: number;
}

export interface RectGeometry {
  shape: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface PolygonGeometry {
  shape: "polygon";
  x: number;
  y: number;
  points: number[]; // flat array [x1, y1, x2, y2, ...] relative to anchor
}

export interface CircleGeometry {
  shape: "circle";
  x: number;
  y: number;
  radius: number;
}

export interface EllipseGeometry {
  shape: "ellipse";
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation?: number;
}

export interface LineGeometry {
  shape: "line";
  x: number;
  y: number;
  points: [number, number, number, number]; // [x1, y1, x2, y2] relative to anchor
}

export interface ArrowGeometry {
  shape: "arrow";
  x: number;
  y: number;
  points: [number, number, number, number]; // [x1, y1, x2, y2] relative to anchor
}

export interface ArcGeometry {
  shape: "arc";
  x: number;
  y: number;
  points: [number, number, number, number, number, number];
  // [x1, y1, cx, cy, x2, y2] relative to anchor
  // x1,y1 = start, cx,cy = control point, x2,y2 = end
}

export type Geometry =
  | RectGeometry
  | PolygonGeometry
  | CircleGeometry
  | EllipseGeometry
  | LineGeometry
  | ArrowGeometry
  | ArcGeometry;

export interface GroupDefinition {
  id: string;
  name: string;
}

export interface ElementProperties {
  name?: string;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  zIndex: number;
  // Booth-specific
  boothSlug?: string;
  exhibitorId?: string | null;
  capacity?: number | null;
  area?: number;
  // Session-specific
  sessionId?: string | null;
  // Meeting room-specific
  meetingRoomId?: string | null;
  // Table-specific (seatplanner) — references SeatTable.code
  tableCode?: string | null;
  // Label-specific
  text?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
  // Icon-specific
  iconName?: string;
  // Element opacity
  opacity?: number; // 0.0–1.0, default 1.0
  // Arrow-specific
  arrowHead?: { style: "triangle" | "chevron"; size: number };
  // Grouping
  groupId?: string;
  // Label customization
  labelPositionV?: "top" | "middle" | "bottom";
  labelPositionH?: "left" | "center" | "right";
  labelColor?: string;
  labelFontSize?: number;
  labelBold?: boolean;
  labelItalic?: boolean;
  labelUnderline?: boolean;
  labelBackground?: { color: string; opacity: number };
  labelVisible?: boolean;
}

export interface FloorPlanElement {
  id: string;
  type: ElementType;
  layer?: LayerId;
  geometry: Geometry;
  properties: ElementProperties;
}

/** Visual defaults saved per element type. All fields optional — only set overrides are stored. */
export interface ElementTypeDefaults {
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  labelColor?: string;
  labelFontSize?: number;
  labelBold?: boolean;
  labelItalic?: boolean;
  labelUnderline?: boolean;
  labelBackground?: { color: string; opacity: number };
  labelVisible?: boolean;
  labelPositionV?: "top" | "middle" | "bottom";
  labelPositionH?: "left" | "center" | "right";
}

/** Open string keys — Phase 11 uses "booth", "session_area", "meeting_room".
 *  Future user-created sub-types add their own keys without a schema migration. */
export type TypeStyles = Record<string, ElementTypeDefaults>;

export const DEFAULT_TYPE_STYLES: TypeStyles = {
  booth:        { color: "#94a3b8", strokeColor: "#888888", strokeWidth: 1, defaultWidth: 120, defaultHeight: 80 },
  session_area: { color: "#27AE60", strokeColor: "#888888", strokeWidth: 1, defaultWidth: 200, defaultHeight: 150 },
  meeting_room: { color: "#F39C12", strokeColor: "#888888", strokeWidth: 1, defaultWidth: 160, defaultHeight: 120 },
  table:        { color: "#14b8a6", strokeColor: "#888888", strokeWidth: 1, defaultWidth: 90,  defaultHeight: 90 },
};

export type StateVisualTreatment =
  | { type: "opacity"; value: number }
  | { type: "hatch"; pattern: "diagonal" | "cross" | "horizontal" | "vertical" }
  | { type: "border"; color: string; style: "solid" | "dashed"; width: number }
  | { type: "none" };

export type OrganizerBoothState = "available" | "reserved" | "on_hold" | "sold";
export type AttendeeBoothState = "available" | "occupied";

export interface ViewerAppearance {
  organizer: Record<OrganizerBoothState, StateVisualTreatment>;
  attendee: Record<AttendeeBoothState, StateVisualTreatment>;
}

export const DEFAULT_VIEWER_APPEARANCE: ViewerAppearance = {
  organizer: {
    available: { type: "hatch", pattern: "diagonal" },
    reserved:  { type: "hatch", pattern: "cross" },
    on_hold:   { type: "border", color: "#888888", style: "dashed", width: 2 },
    sold:      { type: "none" },
  },
  attendee: {
    available: { type: "none" },
    occupied:  { type: "opacity", value: 0.35 },
  },
};

export interface LegendEntry {
  id: string;
  label: string;
  color: string;
  visible: boolean;
}

export interface Legend {
  entries: LegendEntry[];
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  visible: boolean;
}

// --- Background (one upload slot: image, DXF, or — later — PDF) ---
//
// A floor plan has exactly one background source at a time, mirroring the
// single `background_image` FileField on the backend record: one upload path,
// one Replace/Remove, one place a host `onUploadBackground` callback stores
// the raw file. `kind` determines which type-specific fields are populated
// and which controls the Properties panel shows.

export interface BackgroundImageData {
  kind: "image";
  url: string;
  width: number;
  height: number;
  /** Canvas-space offset of the image's top-left. Default 0,0; set negative by
   *  a crop so the image shifts with the rest of the content. */
  x?: number;
  y?: number;
  opacity: number;
}

/** Source DXF layer name, shared by every primitive. Retained so a future
 *  cleanup pass can filter by layer. */
interface DxfPrimitiveBase {
  layer: string;
}

/** An open line segment chain: flat [x1, y1, x2, y2, ...]. */
export interface DxfLine extends DxfPrimitiveBase {
  kind: "line";
  points: number[];
}

/** A polyline: flat [x1, y1, x2, y2, ...], optionally closed. */
export interface DxfPolyline extends DxfPrimitiveBase {
  kind: "polyline";
  points: number[];
  closed?: boolean;
}

/** A native full circle (curves are sampled to polylines; only circles stay native). */
export interface DxfCircle extends DxfPrimitiveBase {
  kind: "circle";
  cx: number;
  cy: number;
  r: number;
}

/** A single text label. */
export interface DxfText extends DxfPrimitiveBase {
  kind: "text";
  text: string;
  x: number;
  y: number;
  height: number; // text height in canvas px
  rotation: number; // text baseline rotation, radians (Y-flip already applied)
}

/** A single renderable primitive parsed from a DXF entity. Coordinates are in
 *  canvas pixels — the fit transform and Y-flip are baked in at import time, so
 *  neither the editor nor the viewer needs the DXF parser to render.
 *
 *  Curved entities (arc, ellipse, spline) are sampled into polylines at parse
 *  time; only full circles are kept native (compact and flip-safe). This keeps
 *  the shared renderer trivial. Discriminate on `kind` to narrow to a variant. */
export type DxfPrimitive = DxfLine | DxfPolyline | DxfCircle | DxfText;

/** An imported DXF drawing rendered as one locked, non-interactive group on the
 *  background layer. Primitives are pre-baked to canvas space; `bounds` and
 *  `sourceUnits` are kept in original DXF space for scale seeding / future re-fit. */
export interface BackgroundDxfData {
  kind: "dxf";
  /** Hosted URL of the original uploaded .dxf file — same upload path as
   *  images (one backend FileField). Not read for rendering (that's what
   *  `primitives` is for); kept for backend bookkeeping / a future re-parse.
   *  Falls back to a client-side object URL when no `onUpload` host callback
   *  is configured (e.g. the standalone demo) — fine for the current session,
   *  won't survive a reload without a real backend. */
  url: string;
  sourceFileName: string;
  primitives: DxfPrimitive[];
  /** Layer names brought in at import time (unchecked layers were excluded
   *  entirely, for payload-size budget reasons — see DxfImportSection). */
  layers: string[];
  /** Layers toggled off afterward in the Properties panel — a subset of
   *  `layers`, filtered at render time. Nothing is re-parsed to change this. */
  hiddenLayers?: string[];
  /** Original DXF-space extent, before the fit transform was baked in. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  /** Real-world unit derived from the DXF $INSUNITS header, if present. */
  sourceUnits?: Unit;
  opacity: number;
}

// Future: | BackgroundPdfData (kind: "pdf")
export type Background = BackgroundImageData | BackgroundDxfData;

export interface Dimensions {
  width: number;
  height: number;
  unit: Unit;
  pixelsPerUnit: number;
}

export interface ScaleCalibration {
  /** First reference point in canvas pixels */
  p1: Point;
  /** Second reference point in canvas pixels */
  p2: Point;
  /** Known real-world distance between p1 and p2 */
  distance: number;
  /** Unit of the known distance */
  unit: Unit;
}

export interface FloorPlanMetadata {
  createdAt: string;
  updatedAt: string;
  scale: number;
}

// --- Walkable grid (Phase 6) ---

export interface WalkableGrid {
  enabled: boolean;
  cellSize: number;
  cols: number;
  rows: number;
  /** 2D array [row][col]: 0 = impassable, 1 = walkable */
  cells: number[][];
}

export interface FloorPlanData {
  version: string;
  id: string;
  name: string;
  dimensions: Dimensions;
  elements: FloorPlanElement[];
  groups?: GroupDefinition[];
  legend: Legend;
  typeStyles?: TypeStyles;
  viewerAppearance?: ViewerAppearance;
  background?: Background;
  backgroundColor?: string;
  walkableLayer?: WalkableGrid;
  scaleCalibration?: ScaleCalibration;
  metadata: FloorPlanMetadata;
}
