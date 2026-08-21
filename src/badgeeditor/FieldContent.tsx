import { Rect, Text, Group, Line, Image as KonvaImage } from "react-konva";
import type { BadgeField } from "./model";
import { fieldValueText, type BadgeData } from "./badgeData";
import { fieldDisplayText } from "./factory";
import { useImageLoader } from "./useImageLoader";

// Generic placeholder — the real name comes from the attendee's purchase at
// print time (badge_generator.py _render_tickets).
const TICKET_NAME_PLACEHOLDER = "Ticket Name";

export function FieldContent({
  field,
  w,
  h,
  fontSize,
  data,
}: {
  field: BadgeField;
  w: number;
  h: number;
  fontSize: number;
  data: BadgeData | null;
}) {
  const isTickets = field.kind === "tickets";
  const rows = field.numRows ?? 1;
  // Ticket QR urls (real per-ticket, or stand-in placeholders) — one hook call.
  const ticketUrls = isTickets
    ? data
      ? data.tickets.slice(0, rows).map(t => t.qrUrl)
      : Array.from({ length: rows }, () => undefined)
    : [];
  const getTicketImg = useImageLoader(ticketUrls);

  if (isTickets) {
    const rowH = h / rows;
    // Each row mirrors a printed ticket: a QR (~80% of row height) + the ticket
    // name, like badge_generator.py _render_tickets.
    const pad = rowH * 0.12;
    const qrSize = Math.max(0, rowH - pad * 2);
    const nameX = pad + qrSize + rowH * 0.18;
    const nameFont = Math.min(14, Math.max(7, rowH * 0.3));
    const count = data ? Math.min(rows, data.tickets.length) : rows;
    return (
      <>
        {/* Perforations are part of the (pre-perforated) media: always numRows-1,
            independent of how many tickets are actually filled. */}
        {Array.from({ length: rows - 1 }).map((_, i) => (
          <Line
            key={`perf-${i}`}
            points={[0, rowH * (i + 1), w, rowH * (i + 1)]}
            stroke="#cbd5e1"
            strokeWidth={1}
            listening={false}
          />
        ))}
        {/* Ticket content fills the top sections. */}
        {Array.from({ length: count }).map((_, i) => {
          const top = rowH * i;
          const name = data ? data.tickets[i].name : TICKET_NAME_PLACEHOLDER;
          const img = getTicketImg(data ? data.tickets[i].qrUrl : undefined);
          return (
            <Group key={i}>
              {img ? (
                <KonvaImage
                  image={img}
                  x={pad}
                  y={top + pad}
                  width={qrSize}
                  height={qrSize}
                  listening={false}
                />
              ) : (
                <Rect
                  x={pad}
                  y={top + pad}
                  width={qrSize}
                  height={qrSize}
                  fill="#0f172a"
                  cornerRadius={2}
                />
              )}
              <Text
                text={name}
                x={nameX}
                y={top}
                width={Math.max(0, w - nameX - pad)}
                height={rowH}
                verticalAlign="middle"
                fontSize={nameFont}
                fontStyle="bold"
                fill="#0f172a"
              />
            </Group>
          );
        })}
      </>
    );
  }

  // session_schedule with real data → one line per session (date · time · speaker)
  if (field.kind === "sessionSchedule" && data) {
    const lineFont = Math.min(fontSize, 11);
    const lineH = lineFont * 1.45;
    if (data.sessions.length === 0) {
      return (
        <Text
          text="(no sessions)"
          width={w}
          height={h}
          align="center"
          verticalAlign="middle"
          fontSize={lineFont}
          fill="#94a3b8"
        />
      );
    }
    return (
      <>
        {data.sessions.map((s, i) => (
          <Text
            key={i}
            x={2}
            y={i * lineH}
            width={w - 4}
            text={`${s.date}  ${s.time}  ${s.speaker}`.trim()}
            fontSize={lineFont}
            fill="#0f172a"
            wrap="none"
            ellipsis
          />
        ))}
      </>
    );
  }

  if (field.kind === "image") {
    return (
      <Text
        text="Image"
        width={w}
        height={h}
        align="center"
        verticalAlign="middle"
        fontSize={14}
        fill="#64748b"
      />
    );
  }

  const text = data ? fieldValueText(field, data) : fieldDisplayText(field);
  return (
    <Text
      text={text}
      width={w}
      height={h}
      align={
        field.textAlign === "justify" ? "left" : (field.textAlign ?? "center")
      }
      verticalAlign="middle"
      fontSize={fontSize}
      fill="#0f172a"
    />
  );
}
