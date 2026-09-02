import { useRef, useEffect } from "react";
import type { Dimensions } from "@/types";
import { GRAY_100, GRAY_200, GRAY_400, GRAY_500 } from "@/canvasColors";

interface RulersProps {
  visible: boolean;
  scale: number;
  position: { x: number; y: number };
  stageSize: { width: number; height: number };
  dimensions: Dimensions;
}

const RULER_SIZE = 22;
const FONT = "10px system-ui, sans-serif";
const BG_COLOR = GRAY_100;
const TICK_COLOR = GRAY_400;
const TEXT_COLOR = GRAY_500;
const BORDER_COLOR = GRAY_200;
const MAJOR_TICK_MIN_PX = 80;

function isCalibrated(dims: Dimensions): boolean {
  return dims.unit !== "px" && dims.pixelsPerUnit > 0;
}

/** Pick a "nice" round interval (1, 2, 5, 10, 20, 50, ...). */
function niceInterval(rough: number): number {
  if (rough <= 0) return 1;
  const exponent = Math.floor(Math.log10(rough));
  const fraction = rough / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
}

/** Format a tick label — drop decimals for whole numbers, 1 decimal otherwise. */
function formatLabel(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function drawHorizontalRuler(
  canvas: HTMLCanvasElement,
  scale: number,
  positionX: number,
  dims: Dimensions,
) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.parentElement?.clientWidth ?? canvas.clientWidth;
  const cssHeight = RULER_SIZE;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Bottom border
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, cssHeight - 0.5);
  ctx.lineTo(cssWidth, cssHeight - 0.5);
  ctx.stroke();

  // Unit conversion: how many screen px per "unit"
  const calibrated = isCalibrated(dims);
  const pxPerUnit = calibrated ? scale * dims.pixelsPerUnit : scale;

  // Tick interval in real units
  const roughInterval = MAJOR_TICK_MIN_PX / pxPerUnit;
  const majorInterval = niceInterval(roughInterval);
  const minorInterval = majorInterval / 5;

  // Visible range in real units
  const startUnit =
    (0 - positionX) / scale / (calibrated ? dims.pixelsPerUnit : 1);
  const endUnit =
    (cssWidth - positionX) / scale / (calibrated ? dims.pixelsPerUnit : 1);

  // Draw minor ticks
  ctx.strokeStyle = TICK_COLOR;
  ctx.lineWidth = 0.5;
  const firstMinor = Math.floor(startUnit / minorInterval) * minorInterval;
  for (let u = firstMinor; u <= endUnit; u += minorInterval) {
    const screenX = u * pxPerUnit + positionX;
    if (screenX < 0 || screenX > cssWidth) continue;
    ctx.beginPath();
    ctx.moveTo(screenX, cssHeight);
    ctx.lineTo(screenX, cssHeight - 6);
    ctx.stroke();
  }

  // Draw major ticks + labels
  ctx.strokeStyle = TICK_COLOR;
  ctx.lineWidth = 1;
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const firstMajor = Math.floor(startUnit / majorInterval) * majorInterval;
  for (let u = firstMajor; u <= endUnit; u += majorInterval) {
    const screenX = u * pxPerUnit + positionX;
    if (screenX < 0 || screenX > cssWidth) continue;

    ctx.beginPath();
    ctx.moveTo(screenX, cssHeight);
    ctx.lineTo(screenX, cssHeight - 12);
    ctx.stroke();

    const label = formatLabel(u);
    ctx.fillText(label, screenX + 3, 3);
  }
}

function drawVerticalRuler(
  canvas: HTMLCanvasElement,
  scale: number,
  positionY: number,
  dims: Dimensions,
) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = RULER_SIZE;
  const cssHeight = canvas.parentElement?.clientHeight ?? canvas.clientHeight;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Right border
  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cssWidth - 0.5, 0);
  ctx.lineTo(cssWidth - 0.5, cssHeight);
  ctx.stroke();

  // Unit conversion
  const calibrated = isCalibrated(dims);
  const pxPerUnit = calibrated ? scale * dims.pixelsPerUnit : scale;

  const roughInterval = MAJOR_TICK_MIN_PX / pxPerUnit;
  const majorInterval = niceInterval(roughInterval);
  const minorInterval = majorInterval / 5;

  const startUnit =
    (0 - positionY) / scale / (calibrated ? dims.pixelsPerUnit : 1);
  const endUnit =
    (cssHeight - positionY) / scale / (calibrated ? dims.pixelsPerUnit : 1);

  // Minor ticks
  ctx.strokeStyle = TICK_COLOR;
  ctx.lineWidth = 0.5;
  const firstMinor = Math.floor(startUnit / minorInterval) * minorInterval;
  for (let u = firstMinor; u <= endUnit; u += minorInterval) {
    const screenY = u * pxPerUnit + positionY;
    if (screenY < 0 || screenY > cssHeight) continue;
    ctx.beginPath();
    ctx.moveTo(cssWidth, screenY);
    ctx.lineTo(cssWidth - 6, screenY);
    ctx.stroke();
  }

  // Major ticks + labels
  ctx.strokeStyle = TICK_COLOR;
  ctx.lineWidth = 1;
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = FONT;

  const firstMajor = Math.floor(startUnit / majorInterval) * majorInterval;
  for (let u = firstMajor; u <= endUnit; u += majorInterval) {
    const screenY = u * pxPerUnit + positionY;
    if (screenY < 0 || screenY > cssHeight) continue;

    ctx.beginPath();
    ctx.moveTo(cssWidth, screenY);
    ctx.lineTo(cssWidth - 12, screenY);
    ctx.stroke();

    // Rotated text
    const label = formatLabel(u);
    ctx.save();
    ctx.translate(3, screenY - 3);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
}

export function Rulers({
  visible,
  scale,
  position,
  stageSize,
  dimensions,
}: RulersProps) {
  const hRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible) return;
    if (hRef.current) {
      drawHorizontalRuler(hRef.current, scale, position.x, dimensions);
    }
    if (vRef.current) {
      drawVerticalRuler(vRef.current, scale, position.y, dimensions);
    }
  }, [
    visible,
    scale,
    position.x,
    position.y,
    stageSize.width,
    stageSize.height,
    dimensions,
  ]);

  if (!visible) return null;

  return (
    <>
      {/* Corner square — unit label */}
      <div
        className="absolute z-10 flex items-center justify-center select-none"
        style={{
          top: 0,
          left: 0,
          width: RULER_SIZE,
          height: RULER_SIZE,
          backgroundColor: BG_COLOR,
          borderRight: `1px solid ${BORDER_COLOR}`,
          borderBottom: `1px solid ${BORDER_COLOR}`,
          fontSize: 9,
          color: TEXT_COLOR,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {dimensions.unit}
      </div>

      {/* Horizontal ruler */}
      <canvas
        ref={hRef}
        className="absolute z-10 pointer-events-none"
        style={{
          top: 0,
          left: RULER_SIZE,
          right: 0,
          height: RULER_SIZE,
        }}
      />

      {/* Vertical ruler */}
      <canvas
        ref={vRef}
        className="absolute z-10 pointer-events-none"
        style={{
          top: RULER_SIZE,
          left: 0,
          bottom: 0,
          width: RULER_SIZE,
        }}
      />
    </>
  );
}
