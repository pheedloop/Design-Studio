export type ActiveTool =
  | "hand"
  | "select"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "arc"
  | "polygon"
  | "text"
  | "icon"
  | "image"
  | "measure";

export type EditorMode = "design" | "placement";

export type PathingTool =
  "select" | "paintWalkable" | "paintImpassable" | "rectFill";

export interface EditorImage {
  id: string;
  url: string;
  name: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}
