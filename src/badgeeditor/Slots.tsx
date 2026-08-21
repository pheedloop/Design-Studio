import { Rect, Circle } from "react-konva";
import type { SlotType } from "./model";
import { PPI } from "./canvasMetrics";

// ---------------------------------------------------------------------------
// Lanyard slot geometry — all values in INCHES. Tweak freely to match physical
// badge stock; everything is measured from the top edge of the front panel and
// centered horizontally.
// ---------------------------------------------------------------------------
const SLOT_SPECS = {
  twoCircle: {
    radius: 0.09, // hole radius
    y: 0.3, // top edge → hole center
    spacing: 2.5, // center-to-center distance between the two holes
  },
  threeRect: {
    width: 0.55, // slot width
    height: 0.13, // slot height
    gap: 0.55, // gap between adjacent slots
    y: 0.18, // top edge → slot top
  },
};

/** Static lanyard hole-punch slots near the top of the front panel. */
export function Slots({ slots, panelW }: { slots: SlotType; panelW: number }) {
  const fill = "#f1f5f9";
  const stroke = "#94a3b8";

  if (slots === "two-circle") {
    const s = SLOT_SPECS.twoCircle;
    const r = s.radius * PPI;
    const cy = s.y * PPI;
    const dx = (s.spacing / 2) * PPI;
    return (
      <>
        <Circle
          x={panelW / 2 - dx}
          y={cy}
          radius={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
          listening={false}
        />
        <Circle
          x={panelW / 2 + dx}
          y={cy}
          radius={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
          listening={false}
        />
      </>
    );
  }

  // three-rect — three pill slots side by side
  const s = SLOT_SPECS.threeRect;
  const sw = s.width * PPI;
  const sh = s.height * PPI;
  const gap = s.gap * PPI;
  const y = s.y * PPI;
  const total = 3 * sw + 2 * gap;
  const startX = (panelW - total) / 2;
  return (
    <>
      {[0, 1, 2].map(i => (
        <Rect
          key={i}
          x={startX + i * (sw + gap)}
          y={y}
          width={sw}
          height={sh}
          cornerRadius={sh / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
          listening={false}
        />
      ))}
    </>
  );
}
