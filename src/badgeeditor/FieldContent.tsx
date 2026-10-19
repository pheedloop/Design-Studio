import { Rect, Text, Group, Line, Image as KonvaImage } from "react-konva";
import { GRAY_300, GRAY_400, GRAY_500, GRAY_900 } from "@/canvasColors";
import type { BadgeField } from "./model";
import { fieldValueText, ticketsForField, type BadgeData } from "./badgeData";
import { fieldDisplayText } from "./factory";
import { useImageLoader } from "./useImageLoader";
import { useT } from "./i18n";
import { useBadgeFontFamily } from "./useBadgeFontFamily";
import { SESSION_FONT_MAX_PT, printFontPx, ptToPx } from "./textMetrics";

// tickets.html: 20px between the QR and the name, in the 16px body font size.
const TICKET_NAME_GAP_PX = 20;
const TICKET_NAME_PX = 16;

// session_schedule.html: date/time/session columns and cell padding, in px.
const SESSION_COLUMNS = [0.2, 0.25, 0.55];
const SESSION_CELL_PAD_X = 4;
const SESSION_CELL_PAD_Y = 2;
const SESSION_LINE_HEIGHT = 1.172;

export function FieldContent({
  field,
  w,
  h,
  fontSize,
  data,
  imageUrl,
}: {
  field: BadgeField;
  w: number;
  h: number;
  fontSize: number;
  data: BadgeData | null;
  imageUrl?: string;
}) {
  const t = useT();
  const fontFamily = useBadgeFontFamily();
  const getImage = useImageLoader(imageUrl ? [imageUrl] : []);

  const isTickets = field.kind === "tickets";
  const rows = field.numRows ?? 1;
  const tickets = isTickets && data ? ticketsForField(field, data.tickets) : [];
  // Ticket QR urls (real per-ticket, or stand-in placeholders) — one hook call.
  const ticketUrls = isTickets
    ? data
      ? tickets.map(t => t.qrUrl)
      : Array.from({ length: rows }, () => undefined)
    : [];
  const getTicketImg = useImageLoader(ticketUrls);

  if (isTickets) {
    const rowH = h / rows;
    // Each row mirrors the generator's tickets.html: a QR at 80% of the row
    // height, then the ticket name after 20px of padding, in the 16px body size.
    const qrSize = rowH * 0.8;
    const pad = (rowH - qrSize) / 2;
    const nameX = qrSize + TICKET_NAME_GAP_PX;
    const count = data ? tickets.length : rows;
    return (
      <>
        {/* Perforations are part of the (pre-perforated) media: always numRows-1,
            independent of how many tickets are actually filled. */}
        {Array.from({ length: rows - 1 }).map((_, i) => (
          <Line
            key={`perf-${i}`}
            points={[0, rowH * (i + 1), w, rowH * (i + 1)]}
            stroke={GRAY_300}
            strokeWidth={1}
            listening={false}
          />
        ))}
        {/* Ticket content fills the top sections. */}
        {Array.from({ length: count }).map((_, i) => {
          const top = rowH * i;
          const name = data
            ? tickets[i].name
            : t("badgeeditor.canvas.ticketName");
          const img = getTicketImg(data ? tickets[i].qrUrl : undefined);
          return (
            <Group
              key={i}
              clipX={0}
              clipY={top}
              clipWidth={w}
              clipHeight={rowH}
            >
              {img ? (
                <KonvaImage
                  image={img}
                  x={0}
                  y={top + pad}
                  width={qrSize}
                  height={qrSize}
                  listening={false}
                />
              ) : (
                <Rect
                  x={0}
                  y={top + pad}
                  width={qrSize}
                  height={qrSize}
                  fill={GRAY_900}
                  cornerRadius={2}
                />
              )}
              <Text
                text={name}
                x={nameX}
                y={top}
                width={Math.max(0, w - nameX)}
                height={rowH}
                verticalAlign="middle"
                fontFamily={fontFamily}
                fontSize={TICKET_NAME_PX}
                fontStyle="bold"
                lineHeight={1}
                fill={GRAY_900}
              />
            </Group>
          );
        })}
      </>
    );
  }

  // session_schedule with real data: the generator's three-column table at
  // min(fontSize, 8) pt. Its header row is not drawn, but its height is kept.
  if (field.kind === "sessionSchedule" && data) {
    const lineFont = ptToPx(
      Math.min(field.fontSize ?? SESSION_FONT_MAX_PT, SESSION_FONT_MAX_PT),
    );
    const rowH = lineFont * SESSION_LINE_HEIGHT + SESSION_CELL_PAD_Y * 2;
    if (data.sessions.length === 0) {
      return (
        <Text
          text={t("badgeeditor.canvas.noSessions")}
          width={w}
          height={h}
          align="center"
          verticalAlign="middle"
          fontFamily={fontFamily}
          fontStyle="bold"
          fontSize={lineFont}
          fill={GRAY_400}
        />
      );
    }
    const columnX = SESSION_COLUMNS.map((_, c) =>
      SESSION_COLUMNS.slice(0, c).reduce((x, f) => x + f * w, 0),
    );
    return (
      <Group clipX={0} clipY={0} clipWidth={w} clipHeight={h}>
        <Line
          points={[0, rowH, w, rowH]}
          stroke={GRAY_900}
          strokeWidth={1}
          listening={false}
        />
        {data.sessions.map((s, i) =>
          [s.date, s.time, s.speaker].map((cell, c) => (
            <Text
              key={`${i}-${c}`}
              x={columnX[c] + SESSION_CELL_PAD_X}
              y={rowH + 1 + i * rowH + SESSION_CELL_PAD_Y}
              width={SESSION_COLUMNS[c] * w - SESSION_CELL_PAD_X * 2}
              text={cell}
              fontFamily={fontFamily}
              fontStyle="bold"
              fontSize={lineFont}
              lineHeight={SESSION_LINE_HEIGHT}
              fill={GRAY_900}
              wrap="none"
              ellipsis
            />
          )),
        )}
      </Group>
    );
  }

  if (field.kind === "image") {
    const img = imageUrl ? getImage(imageUrl) : null;
    if (img) {
      return <KonvaImage image={img} width={w} height={h} />;
    }
    return (
      <Text
        text={t("badgeeditor.field.image")}
        width={w}
        height={h}
        align="center"
        verticalAlign="middle"
        fontSize={14}
        fill={GRAY_500}
      />
    );
  }

  const text = data ? fieldValueText(field, data) : fieldDisplayText(field, t);
  return (
    <Group clipX={0} clipY={0} clipWidth={w} clipHeight={h}>
      <Text
        text={text}
        width={w}
        height={h}
        align={
          field.textAlign === "justify" ? "left" : (field.textAlign ?? "center")
        }
        verticalAlign="top"
        fontFamily={fontFamily}
        fontStyle="bold"
        lineHeight={1}
        fontSize={printFontPx({ ...field, fontSize }, text)}
        fill={GRAY_900}
      />
    </Group>
  );
}
