import { Button } from "@/components/Button";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { FieldRow, SectionLabel, Select } from "@/editor/components/ui";
import type { BackgroundFit, BadgePageBackground } from "./model";
import { useBadgeImageUrl } from "./badgeImageContext";
import { useT, type StringKey } from "./i18n";

const FITS: { value: BackgroundFit; labelKey: StringKey }[] = [
  { value: "cover", labelKey: "badgeeditor.background.fitCover" },
  { value: "contain", labelKey: "badgeeditor.background.fitContain" },
  { value: "stretch", labelKey: "badgeeditor.background.fitStretch" },
];

export function PanelBackgroundControls({
  background,
  onChoose,
  onChange,
}: {
  background?: BadgePageBackground;
  onChoose: () => void;
  onChange: (background: BadgePageBackground | undefined) => void;
}) {
  const t = useT();
  const url = useBadgeImageUrl()(background?.imageCode);
  return (
    <Stack gap="xxs" className="p-xs border-b border-border-neutral-light">
      <SectionLabel>{t("badgeeditor.background.title")}</SectionLabel>
      {background ? (
        <>
          {url && (
            <button
              type="button"
              onClick={onChoose}
              aria-label={t("badgeeditor.background.replace")}
              className="block w-full h-16 rounded-md border border-border-neutral-light overflow-hidden bg-surface-neutral"
            >
              <img
                src={url}
                alt=""
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            </button>
          )}
          <FieldRow label={t("badgeeditor.background.fit")}>
            <Select
              className="w-full"
              value={background.fit}
              onChange={e =>
                onChange({
                  ...background,
                  fit: e.target.value as BackgroundFit,
                })
              }
            >
              {FITS.map(fit => (
                <option key={fit.value} value={fit.value}>
                  {t(fit.labelKey)}
                </option>
              ))}
            </Select>
          </FieldRow>
          <Row gap="xxs">
            <Button variant="outline" size="sm" onClick={onChoose}>
              {t("badgeeditor.background.replace")}
            </Button>
            <Button
              variant="ghost"
              color="negative"
              size="sm"
              onClick={() => onChange(undefined)}
            >
              {t("badgeeditor.background.remove")}
            </Button>
          </Row>
        </>
      ) : (
        <Button variant="outline" size="sm" onClick={onChoose}>
          {t("badgeeditor.background.choose")}
        </Button>
      )}
    </Stack>
  );
}
