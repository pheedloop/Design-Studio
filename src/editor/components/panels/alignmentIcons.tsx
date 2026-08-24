// Alignment / distribution glyphs, shared by the map editor's OptionsBar and
// the badge editor so both surfaces show the exact same tools.
//
// Each is rails (the axis being aligned to) plus blocks (the elements); only the
// coordinates differ, so they live in a table.

/** [x1, y1, x2, y2] in the 14×14 viewBox. */
type Rail = [number, number, number, number];
/** [x, y, width, height] in the 14×14 viewBox. */
type Block = [number, number, number, number];

export type AlignmentGlyphName =
  | "alignLeft"
  | "alignCenterH"
  | "alignRight"
  | "alignTop"
  | "alignCenterV"
  | "alignBottom"
  | "distributeH"
  | "distributeV";

const GLYPHS: Record<AlignmentGlyphName, { rails: Rail[]; blocks: Block[] }> = {
  alignLeft: {
    rails: [[2, 1.5, 2, 12.5]],
    blocks: [
      [3.5, 2.5, 7, 3.5],
      [3.5, 8, 4.5, 3.5],
    ],
  },
  alignCenterH: {
    rails: [[7, 1.5, 7, 12.5]],
    blocks: [
      [3.5, 2.5, 7, 3.5],
      [4.75, 8, 4.5, 3.5],
    ],
  },
  alignRight: {
    rails: [[12, 1.5, 12, 12.5]],
    blocks: [
      [3.5, 2.5, 7, 3.5],
      [6, 8, 4.5, 3.5],
    ],
  },
  alignTop: {
    rails: [[1.5, 2, 12.5, 2]],
    blocks: [
      [2.5, 3.5, 3.5, 7],
      [8, 3.5, 3.5, 4.5],
    ],
  },
  alignCenterV: {
    rails: [[1.5, 7, 12.5, 7]],
    blocks: [
      [2.5, 3.5, 3.5, 7],
      [8, 4.75, 3.5, 4.5],
    ],
  },
  alignBottom: {
    rails: [[1.5, 12, 12.5, 12]],
    blocks: [
      [2.5, 3.5, 3.5, 7],
      [8, 6, 3.5, 4.5],
    ],
  },
  distributeH: {
    rails: [
      [1.5, 1.5, 1.5, 12.5],
      [12.5, 1.5, 12.5, 12.5],
    ],
    blocks: [
      [3.5, 4, 2.5, 6],
      [8, 4, 2.5, 6],
    ],
  },
  distributeV: {
    rails: [
      [1.5, 1.5, 12.5, 1.5],
      [1.5, 12.5, 12.5, 12.5],
    ],
    blocks: [
      [4, 3.5, 6, 2.5],
      [4, 8, 6, 2.5],
    ],
  },
};

export function AlignmentGlyph({ name }: { name: AlignmentGlyphName }) {
  const { rails, blocks } = GLYPHS[name];
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      width="14"
      height="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      {rails.map(([x1, y1, x2, y2], i) => (
        <line
          key={`rail-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      {blocks.map(([x, y, width, height], i) => (
        <rect
          key={`block-${i}`}
          x={x}
          y={y}
          width={width}
          height={height}
          rx="0.5"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
