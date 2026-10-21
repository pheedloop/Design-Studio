import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import type { AttendeeOption, BadgePreviewImage } from "./badgeData";
import { useT } from "./i18n";

interface BadgeServerPreviewProps {
  attendee: AttendeeOption;
  render: (id: string) => Promise<BadgePreviewImage>;
  /** Changing this re-renders the preview (the last saved document). */
  refreshKey: unknown;
}

interface Result {
  id: string;
  refreshKey: unknown;
  image: BadgePreviewImage | null;
}

/** The badge as the host actually generates it, from the last saved template. */
export function BadgeServerPreview({
  attendee,
  render,
  refreshKey,
}: BadgeServerPreviewProps) {
  const t = useT();
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    render(attendee.id)
      .then(
        image => image,
        () => null,
      )
      .then(image => {
        if (!cancelled) setResult({ id: attendee.id, refreshKey, image });
      });
    return () => {
      cancelled = true;
    };
  }, [render, attendee.id, refreshKey, attempt]);

  const current =
    result?.id === attendee.id && result.refreshKey === refreshKey
      ? result
      : null;

  return (
    <div className="flex h-full items-center justify-center overflow-auto bg-surface-neutral p-xs">
      {!current ? (
        <div className="text-xs text-text-subtle">
          {t("badgeeditor.preview.generating")}
        </div>
      ) : current.image ? (
        <img
          src={current.image.src}
          alt={t("badgeeditor.preview.imageAlt", { name: attendee.name })}
          style={{
            aspectRatio: `${current.image.widthIn} / ${current.image.heightIn}`,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          className="bg-white shadow-lg"
        />
      ) : (
        <div role="alert" className="flex flex-col items-center gap-xs">
          <div className="text-xs text-red-700">
            {t("badgeeditor.preview.failed")}
          </div>
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => {
              setResult(null);
              setAttempt(a => a + 1);
            }}
          >
            {t("badgeeditor.preview.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
