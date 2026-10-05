import {
  PiTextAlignLeft,
  PiTextAlignCenter,
  PiTextAlignRight,
  PiTextAlignJustify,
  PiTrash,
} from "react-icons/pi";
import { IconButton } from "@/components/IconButton";
import {
  Select,
  SectionLabel,
  SortablePicklist,
  FieldRow,
  TextInput,
} from "@/editor/components/ui";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import {
  inchToPx,
  type BadgeField,
  type BadgeTicketType,
  type TextAlign,
} from "./model";
import {
  INTERNAL_CODE_FIELD,
  isLiteralTextField,
  isUserFieldEditable,
} from "./fields";
import { fieldHeading, printAsPatch } from "./factory";
import { Checkbox } from "@/components/Checkbox";
import { useT, type StringKey } from "./i18n";

const FONT_SIZES = [10, 12, 16, 18, 20, 24, 30, 36, 42];
const ROW_COUNTS = [1, 2, 3, 4, 5, 6];
const ALIGNMENTS: {
  value: TextAlign;
  labelKey: StringKey;
  icon: React.ReactNode;
}[] = [
  {
    value: "left",
    labelKey: "badgeeditor.properties.alignLeft",
    icon: <PiTextAlignLeft size={15} />,
  },
  {
    value: "center",
    labelKey: "badgeeditor.properties.alignCenter",
    icon: <PiTextAlignCenter size={15} />,
  },
  {
    value: "right",
    labelKey: "badgeeditor.properties.alignRight",
    icon: <PiTextAlignRight size={15} />,
  },
  {
    value: "justify",
    labelKey: "badgeeditor.properties.alignJustify",
    icon: <PiTextAlignJustify size={15} />,
  },
];

const TOKENS = [
  "{{ first_name }}",
  "{{ last_name }}",
  "{{ organization }}",
  "{{ title }}",
  "{{ designations }}",
  "{{ pronouns }}",
  "{{ city }}",
  "{{ country }}",
  "{{ internal_code }}",
  "{{ dietary_restrictions }}",
];

interface PropertiesPanelProps {
  field: BadgeField | null;
  ticketTypes: BadgeTicketType[];
  onChange: (patch: Partial<BadgeField>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({
  field,
  ticketTypes,
  onChange,
  onDelete,
}: PropertiesPanelProps) {
  const t = useT();
  if (!field) {
    return (
      <div className="w-48 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
        <Row align="center" justify="center" className="flex-1 p-m text-center">
          <span className="text-xs text-text-subtle">
            {t("badgeeditor.properties.empty")}
          </span>
        </Row>
      </div>
    );
  }

  const label = fieldHeading(field, t);
  const isText = field.kind === "text" || field.kind === "sessionSchedule";

  const setFontSize = (fontSize: number) => {
    const numLines =
      field.height != null
        ? Math.max(1, Math.floor(inchToPx(field.height) / fontSize))
        : field.numLines;
    onChange({ fontSize, numLines });
  };

  return (
    <div className="w-52 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
      <Row
        px="xs"
        py="xxs"
        align="center"
        justify="between"
        className="border-b border-border-neutral-light"
      >
        <Text size="xs" weight="medium" color="body" as="span" truncate>
          {label}
        </Text>
        <IconButton
          size="sm"
          onClick={onDelete}
          title={t("badgeeditor.properties.deleteField")}
        >
          <PiTrash size={15} />
        </IconButton>
      </Row>

      <Stack gap="s" className="p-xs overflow-y-auto flex-1">
        {field.field === INTERNAL_CODE_FIELD && (
          <FieldRow label={t("badgeeditor.properties.printAs")}>
            <Select
              className="w-full"
              value={field.printAsQr ? "qr" : "text"}
              onChange={e =>
                onChange(printAsPatch(field, e.target.value === "qr"))
              }
            >
              <option value="text">
                {t("badgeeditor.properties.printAsText")}
              </option>
              <option value="qr">
                {t("badgeeditor.properties.printAsQr")}
              </option>
            </Select>
          </FieldRow>
        )}

        {isLiteralTextField(field.field) && (
          <Stack gap="tight">
            <SectionLabel>{t("badgeeditor.properties.text")}</SectionLabel>
            <TextInput
              value={field.text ?? ""}
              onChange={e => onChange({ text: e.target.value })}
            />
          </Stack>
        )}

        {isText && (
          <Stack gap="xxs">
            <FieldRow label={t("badgeeditor.properties.size")}>
              <Select
                className="w-full"
                value={field.fontSize ?? 20}
                onChange={e => setFontSize(Number(e.target.value))}
              >
                {FONT_SIZES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FieldRow>
            <FieldRow label={t("badgeeditor.properties.align")}>
              <Row gap="xxxs">
                {ALIGNMENTS.map(a => (
                  <IconButton
                    key={a.value}
                    size="sm"
                    active={(field.textAlign ?? "center") === a.value}
                    onClick={() => onChange({ textAlign: a.value })}
                    title={t(a.labelKey)}
                  >
                    {a.icon}
                  </IconButton>
                ))}
              </Row>
            </FieldRow>
          </Stack>
        )}

        {field.kind === "tickets" && (
          <FieldRow label={t("badgeeditor.properties.rows")}>
            <Select
              className="w-full"
              value={field.numRows ?? 3}
              onChange={e => onChange({ numRows: Number(e.target.value) })}
            >
              {ROW_COUNTS.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </FieldRow>
        )}

        {field.kind === "tickets" && ticketTypes.length > 0 && (
          <Stack gap="tight">
            <SectionLabel>
              {t("badgeeditor.properties.ticketTypes")}
            </SectionLabel>
            <SortablePicklist
              options={ticketTypes.map(ticketType => ({
                value: ticketType.code,
                label: ticketType.name,
              }))}
              value={field.ticketCodes ?? []}
              onChange={ticketCodes => onChange({ ticketCodes })}
              addLabel={t("badgeeditor.properties.addTicketType")}
              emptyTitle={t("badgeeditor.properties.allTickets")}
              emptyHint={t("badgeeditor.properties.allTicketsHint")}
              removeLabel={name =>
                t("badgeeditor.properties.removeTicketType", { name })
              }
            />
          </Stack>
        )}

        {(isText || field.kind === "tickets") && (
          <Stack gap="xxs">
            <Checkbox
              label={t("badgeeditor.properties.invert")}
              checked={Boolean(field.inverted)}
              onChange={v => onChange({ inverted: v })}
            />
            {isText && isUserFieldEditable(field.field) && (
              <Checkbox
                label={t("badgeeditor.properties.attendeeEditable")}
                checked={field.userEditable ?? true}
                onChange={v => onChange({ userEditable: v })}
              />
            )}
          </Stack>
        )}

        {field.field === "custom_text" && (
          <Stack gap="tight">
            <SectionLabel>
              {t("badgeeditor.properties.insertToken")}
            </SectionLabel>
            <Row gap="xxxs" className="flex-wrap">
              {TOKENS.map(token => (
                <button
                  key={token}
                  type="button"
                  onClick={() =>
                    onChange({
                      text: field.text ? `${field.text} ${token}` : token,
                    })
                  }
                  className="text-xs px-tight py-hair rounded bg-surface-neutral hover:bg-surface-muted text-text-body font-mono"
                >
                  {token.replace(/[{}]/g, "").trim()}
                </button>
              ))}
            </Row>
          </Stack>
        )}

        {(field.kind === "qrCode" || field.kind === "image") && (
          <p className="text-xs text-text-subtle">
            {t("badgeeditor.properties.resizeHint")}
          </p>
        )}
      </Stack>
    </div>
  );
}
