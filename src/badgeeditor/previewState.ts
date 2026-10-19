import type { AttendeeOption } from "./badgeData";
import type { T } from "./i18n";

/** Why the full preview can't be entered, or null when it can. */
export function previewAvailability(
  input: { serverPreview: boolean; attendee: AttendeeOption | null },
  t: T,
): string | null {
  return input.serverPreview && !input.attendee
    ? t("badgeeditor.preview.chooseAttendee")
    : null;
}

/** Warning shown over a server preview that lags the editor, or null. */
export function previewNotices(
  input: { serverPreview: boolean; isDirty: boolean },
  t: T,
): string | null {
  return input.serverPreview && input.isDirty
    ? t("badgeeditor.preview.unsaved")
    : null;
}
