import { Rect, Text, Group, Line, Image as KonvaImage } from "react-konva";
import { GRAY_300, GRAY_500, GRAY_900 } from "@/canvasColors";
import type { BadgeField } from "./model";
import { fieldValueText, ticketsForField, type BadgeData } from "./badgeData";
import { fieldDisplayText } from "./factory";
import { useImageLoader } from "./useImageLoader";
import { useT } from "./i18n";
import { useBadgeFontFamily } from "./useBadgeFontFamily";
import { SessionScheduleContent } from "./SessionScheduleContent";
import type { SessionRow } from "./sessionLayout";
import { SESSION_FONT_MAX_PT, printFontPx, ptToPx } from "./textMetrics";

// tickets.html: 20px between the QR and the name, in the 16px body font size.
const TICKET_NAME_GAP_PX = 20;
const TICKET_NAME_PX = 16;

export function FieldContent({
  field,
  w,
  h,
  fontSize,
  data,
  effectiveInverted,
  imageUrl,
}: {
  field: BadgeField;
  w: number;
  h: number;
  fontSize: number;
  data: BadgeData | null;
  /** The print's rotation of this field: own inversion XOR page fold inversion. */
  effectiveInverted: boolean;
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

  if (field.kind === "sessionSchedule") {
    const rows: SessionRow[] = !data
      ? [{ placeholder: fieldDisplayText(field, t) }]
      : data.sessions.length === 0
        ? [{ placeholder: t("badgeeditor.canvas.noSessions") }]
        : data.sessions.map(s => [s.date, s.time, s.speaker]);
    return (
      <SessionScheduleContent
        w={w}
        h={h}
        fontPx={ptToPx(
          Math.min(field.fontSize ?? SESSION_FONT_MAX_PT, SESSION_FONT_MAX_PT),
        )}
        fontFamily={fontFamily}
        rows={rows}
        inverted={effectiveInverted}
        mutedPlaceholder={data !== null}
      />
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
