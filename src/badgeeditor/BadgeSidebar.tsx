import {
  PiTextT,
  PiQrCode,
  PiTicket,
  PiImage,
  PiCalendarBlank,
  PiTagSimple,
  PiAddressBook,
} from "react-icons/pi";
import { SectionLabel } from "@/editor/components/ui";
import { FIELD_DEFS, type FieldDef } from "./fields";
import { BadgeSidebarHeader } from "./BadgeSidebarHeader";

function iconFor(def: FieldDef) {
  if (def.kind === "qrCode") return <PiQrCode size={16} />;
  if (def.kind === "tickets") return <PiTicket size={16} />;
  if (def.kind === "image") return <PiImage size={16} />;
  if (def.kind === "sessionSchedule") return <PiCalendarBlank size={16} />;
  if (def.field === "tags") return <PiTagSimple size={16} />;
  if (def.field.startsWith("address_") || def.field === "city_state")
    return <PiAddressBook size={16} />;
  return <PiTextT size={16} />;
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
    <div className="flex flex-col w-48 shrink-0 bg-white border-r border-gray-200 overflow-hidden">
      <BadgeSidebarHeader name={name} onNameChange={onNameChange} />
      <div className="flex-1 overflow-y-auto py-2 px-1">
        <div className="px-2 pb-1">
          <SectionLabel>Add Field</SectionLabel>
        </div>
        {fields.map(d => (
          <button
            key={d.field}
            type="button"
            onClick={() => onAddField(d.field)}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <span className="shrink-0 flex items-center w-4 text-gray-400">
              {iconFor(d)}
            </span>
            <span className="flex-1 text-left">{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
