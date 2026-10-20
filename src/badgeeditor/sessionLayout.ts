// Mirrors pikachu's badge/fields/session_schedule.html: a fixed-layout,
// collapsed-border table, Date 20% / Time 25% / Session the rest, cells padded
// 2px 4px, top-aligned, wrapping. The wrapper has a width but no height, so the
// table is as tall as its rows and is never clipped to the field box.

// Badge content mirrored from the pikachu template, so not localised.
export const SESSION_HEADER_LABELS = ["Date", "Time", "Session"] as const;

// th width:20% / 25% is the content box: the cell padding comes on top.
const COLUMN_FRACTIONS = [0.2, 0.25] as const;
export const SESSION_CELL_PAD_X = 4;
export const SESSION_CELL_PAD_Y = 2;
// Roboto Condensed Bold hhea ascent and descent over the 2048 em. The PNG
// render hints font metrics, so a line is ceil(ascent) + ceil(descent) px.
const ASCENT_EM = 1900 / 2048;
const DESCENT_EM = 500 / 2048;
const HEADER_RULE_PX = 1;

/** Line box height WeasyPrint's hinted (PNG) render gives text of `fontPx`. */
export function sessionLineHeight(fontPx: number): number {
  return Math.ceil(ASCENT_EM * fontPx) + Math.ceil(DESCENT_EM * fontPx);
}

/** Width of `text` in px at `fontPx`. */
export type MeasureText = (text: string, fontPx: number) => number;

/** A row of three cells, or one placeholder line across the table. */
export type SessionRow = string[] | { placeholder: string };

export interface SessionLine {
  text: string;
  x: number;
  y: number;
  /** Width the print gives this line. */
  width: number;
  header: boolean;
  placeholder: boolean;
}

export interface SessionLayout {
  lines: SessionLine[];
  /** y of the rule under the header row. */
  ruleY: number;
  contentHeight: number;
  /** Height of one line box. */
  lineHeight: number;
  /** Where the content starts in the field box: 0, or far end when inverted. */
  offsetY: number;
}

export function sessionColumns(width: number): { x: number; width: number }[] {
  const first = COLUMN_FRACTIONS[0] * width + SESSION_CELL_PAD_X * 2;
  const second = COLUMN_FRACTIONS[1] * width + SESSION_CELL_PAD_X * 2;
  return [
    { x: 0, width: first },
    { x: first, width: second },
    { x: first + second, width: width - first - second },
  ];
}

/** Greedy word wrap, breaking at spaces and after hyphens, never inside a word. */
export function wrapLines(
  text: string,
  maxWidth: number,
  fontPx: number,
  measure: MeasureText,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const pieces = word.split(/(?<=-)(?=.)/);
    pieces.forEach((piece, i) => {
      const joiner = i === 0 && line ? " " : "";
      if (line && measure(line + joiner + piece, fontPx) > maxWidth) {
        lines.push(line);
        line = piece;
      } else {
        line += joiner + piece;
      }
    });
  }
  if (line) lines.push(line);
  return lines;
}

interface Cell {
  lines: string[];
  x: number;
  header: boolean;
  placeholder: boolean;
}

/**
 * Lays the table out in content coordinates (origin at the table's top-left),
 * then places it in the field box. A non-inverted table starts at the box top.
 * An inverted one is rotated 180° about its own centre in print, so on the
 * upright (field-inverted) canvas it ends at the box bottom; when taller than
 * the box it overhangs the top.
 */
export function layoutSessionTable(input: {
  width: number;
  boxHeight: number;
  fontPx: number;
  rows: SessionRow[];
  /** Effective inversion: the field's own XOR its panel's fold inversion. */
  inverted: boolean;
  measure: MeasureText;
}): SessionLayout {
  const { width, boxHeight, fontPx, rows, inverted, measure } = input;
  const columns = sessionColumns(width);
  const lineH = sessionLineHeight(fontPx);
  const pad = SESSION_CELL_PAD_X;
  const lines: SessionLine[] = [];

  const place = (cells: Cell[], top: number, vCenter: boolean): number => {
    const tallest = Math.max(0, ...cells.map(c => c.lines.length));
    const rowH = tallest * lineH + SESSION_CELL_PAD_Y * 2;
    for (const cell of cells) {
      const free = (tallest - cell.lines.length) * lineH;
      const start = top + SESSION_CELL_PAD_Y + (vCenter ? free / 2 : 0);
      cell.lines.forEach((text, i) =>
        lines.push({
          text,
          x: cell.x + pad,
          y: start + i * lineH,
          width: measure(text, fontPx),
          header: cell.header,
          placeholder: cell.placeholder,
        }),
      );
    }
    return rowH;
  };

  const wrap = (text: string, colWidth: number) =>
    wrapLines(text, colWidth - pad * 2, fontPx, measure);

  const headerH = place(
    SESSION_HEADER_LABELS.map((label, c) => ({
      lines: wrap(label, columns[c].width),
      x: columns[c].x,
      header: true,
      placeholder: false,
    })),
    0,
    true,
  );
  const ruleY = headerH + HEADER_RULE_PX / 2;

  let y = headerH + HEADER_RULE_PX;
  for (const row of rows) {
    const cells: Cell[] = Array.isArray(row)
      ? columns.map((col, c) => ({
          lines: wrap(row[c] ?? "", col.width),
          x: col.x,
          header: false,
          placeholder: false,
        }))
      : [
          {
            lines: wrap(row.placeholder, width),
            x: 0,
            header: false,
            placeholder: true,
          },
        ];
    y += place(cells, y, false);
  }

  return {
    lines,
    ruleY,
    contentHeight: y,
    lineHeight: lineH,
    offsetY: inverted ? boxHeight - y : 0,
  };
}
