import type { ElementType, Geometry } from "../../types";
import type { StringKey, T } from "../i18n";

/** Type name shown in the properties header, for every element that isn't a shape. */
const ELEMENT_TYPE_LABEL: Record<Exclude<ElementType, "shape">, StringKey> = {
  booth: "common.type.booth",
  icon: "editor.type.icon",
  label: "editor.type.label",
  meeting_room: "common.type.meetingRoom",
  session_area: "editor.type.sessionLocation",
  stage: "editor.type.stage",
  table: "editor.type.table",
  walkway: "editor.type.walkway",
  wall: "editor.type.wall",
};

const SHAPE_LABEL: Record<Geometry["shape"], StringKey> = {
  arc: "editor.shape.arc",
  arrow: "editor.shape.arrow",
  circle: "editor.shape.circle",
  ellipse: "editor.shape.ellipse",
  line: "editor.shape.line",
  polygon: "editor.shape.polygon",
  rect: "editor.shape.rect",
};

/** A shape is named by its geometry; an arrowhead makes a line an arrow. */
export function elementTypeLabel(
  element: {
    type: ElementType;
    geometry: Geometry;
    properties: { arrowHead?: unknown };
  },
  t: T,
): string {
  if (element.type !== "shape") return t(ELEMENT_TYPE_LABEL[element.type]);
  if (element.properties.arrowHead) return t(SHAPE_LABEL.arrow);
  return t(SHAPE_LABEL[element.geometry.shape]);
}
