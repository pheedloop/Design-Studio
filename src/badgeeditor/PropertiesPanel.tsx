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
  FieldRow,
  TextInput,
} from "@/editor/components/ui";
import { Row } from "@/components/Row";
import { Stack } from "@/components/Stack";
import { Text } from "@/components/Text";
import { inchToPx, type BadgeField, type TextAlign } from "./model";
import { getFieldDef, isLiteralTextField, isUserFieldEditable } from "./fields";
import { Checkbox } from "@/components/Checkbox";

const FONT_SIZES = [10, 12, 16, 18, 20, 24, 30, 36, 42];
const ROW_COUNTS = [1, 2, 3, 4, 5, 6];
const ALIGNMENTS: { value: TextAlign; icon: React.ReactNode }[] = [
  { value: "left", icon: <PiTextAlignLeft size={15} /> },
  { value: "center", icon: <PiTextAlignCenter size={15} /> },
  { value: "right", icon: <PiTextAlignRight size={15} /> },
  { value: "justify", icon: <PiTextAlignJustify size={15} /> },
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
  onChange: (patch: Partial<BadgeField>) => void;
  onDelete: () => void;
}

export function PropertiesPanel({
  field,
  onChange,
  onDelete,
}: PropertiesPanelProps) {
  if (!field) {
    return (
      <div className="w-48 shrink-0 border-l border-border-neutral-light bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-m text-center">
          <span className="text-xs text-text-subtle">
            Select a field to edit its properties.
          </span>
        </div>
      </div>
    );
  }

  const label = getFieldDef(field.field)?.label ?? field.field;
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
      <div className="px-xs py-xxs border-b border-border-neutral-light flex items-center justify-between">
        <Text size="xs" weight="medium" color="body" as="span" truncate>
          {label}
        </Text>
        <IconButton size="sm" onClick={onDelete} title="Delete field">
          <PiTrash size={15} />
        </IconButton>
      </div>

      <Stack gap="s" className="p-xs overflow-y-auto flex-1">
        {isLiteralTextField(field.field) && (
          <Stack gap="tight">
            <SectionLabel>Text</SectionLabel>
            <TextInput
              value={field.text ?? ""}
              onChange={e => onChange({ text: e.target.value })}
            />
          </Stack>
        )}

        {isText && (
          <Stack gap="xxs">
            <FieldRow label="Size">
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
            <FieldRow label="Align">
              <Row gap="xxxs">
                {ALIGNMENTS.map(a => (
                  <IconButton
                    key={a.value}
                    size="sm"
                    active={(field.textAlign ?? "center") === a.value}
                    onClick={() => onChange({ textAlign: a.value })}
                    title={a.value}
                  >
                    {a.icon}
                  </IconButton>
                ))}
              </Row>
            </FieldRow>
          </Stack>
        )}

        {field.kind === "tickets" && (
          <FieldRow label="Rows">
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

        {(isText || field.kind === "tickets") && (
          <Stack gap="xxs">
            <Checkbox
              label="Invert (180°)"
              checked={Boolean(field.inverted)}
              onChange={v => onChange({ inverted: v })}
            />
            {isText && isUserFieldEditable(field.field) && (
              <Checkbox
                label="Attendee editable"
                checked={field.userEditable ?? true}
                onChange={v => onChange({ userEditable: v })}
              />
            )}
          </Stack>
        )}

        {isLiteralTextField(field.field) && (
          <Stack gap="tight">
            <SectionLabel>Insert token</SectionLabel>
            <Row gap="xxxs" className="flex-wrap">
              {TOKENS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    onChange({ text: field.text ? `${field.text} ${t}` : t })
                  }
                  className="text-[11px] px-tight py-hair rounded bg-surface-neutral hover:bg-surface-muted text-text-body font-mono"
                >
                  {t.replace(/[{}]/g, "").trim()}
                </button>
              ))}
            </Row>
          </Stack>
        )}

        {(field.kind === "qrCode" || field.kind === "image") && (
          <p className="text-xs text-text-subtle">
            Drag to move; drag a corner to resize.
          </p>
        )}
      </Stack>
    </div>
  );
}
