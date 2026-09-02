import {
  PiTextT,
  PiQrCode,
  PiTicket,
  PiImage,
  PiCalendarBlank,
  PiTagSimple,
  PiAddressBook,
} from "react-icons/pi";
import { SidebarRow } from "@/components/SidebarRow";
import { SectionLabel } from "@/editor/components/ui";
import { FIELD_DEFS, type FieldDef } from "./fields";
import { BadgeSidebarHeader } from "./BadgeSidebarHeader";

const iconProps = { size: 16, className: "text-text-subtle" };

function iconFor(def: FieldDef) {
  if (def.kind === "qrCode") return <PiQrCode {...iconProps} />;
  if (def.kind === "tickets") return <PiTicket {...iconProps} />;
  if (def.kind === "image") return <PiImage {...iconProps} />;
  if (def.kind === "sessionSchedule") return <PiCalendarBlank {...iconProps} />;
  if (def.field === "tags") return <PiTagSimple {...iconProps} />;
  if (def.field.startsWith("address_") || def.field === "city_state")
    return <PiAddressBook {...iconProps} />;
  return <PiTextT {...iconProps} />;
}

interface BadgeSidebarProps {
  name: string;
  onNameChange: (name: string) => void;
  onAddField: (fieldKey: string) => void;
}

/**
 * Left sidebar — mirrors the map editor's ToolSidebar: a name header followed
 * by a list of "tool" rows. For badges the rows are the field palette; clicking
 * one adds that field to the canvas.
 */
export function BadgeSidebar({
  name,
  onNameChange,
  onAddField,
}: BadgeSidebarProps) {
  const fields = FIELD_DEFS.filter(d => d.inPalette !== false);

  return (
    <div className="flex flex-col w-48 shrink-0 bg-white border-r border-border-neutral-light overflow-hidden">
      <BadgeSidebarHeader name={name} onNameChange={onNameChange} />
      <div className="flex-1 overflow-y-auto py-2 px-1">
        <div className="px-2 pb-1">
          <SectionLabel>Add Field</SectionLabel>
        </div>
        {fields.map(d => (
          <SidebarRow
            key={d.field}
            label={d.label}
            icon={iconFor(d)}
            onClick={() => onAddField(d.field)}
          />
        ))}
      </div>
    </div>
  );
}
