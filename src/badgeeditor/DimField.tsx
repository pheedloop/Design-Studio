import { useState } from "react";
import { SectionLabel } from "@/editor/components/ui";
import {
  fmtUnit,
  fromUnit,
  unitLabel,
  unitMin,
  unitStep,
  type Unit,
} from "./units";

/**
 * Fractional dimension input (NumberInput rounds to integers, so not usable
 * here). The stored `value` is always inches; the field displays and accepts
 * the current `unit` and converts back to inches on change.
 */
export function DimField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  /** Value in inches. */
  value: number;
  unit: Unit;
  /** Reports the new value in inches. */
  onChange: (inches: number) => void;
}) {
  // Track the raw text so partial edits (e.g. "2.") aren't clobbered, and reset
  // it whenever the unit or stored value changes.
  const [text, setText] = useState(fmtUnit(value, unit, 3));
  const [editingUnit, setEditingUnit] = useState(unit);
  if (editingUnit !== unit) {
    setEditingUnit(unit);
    setText(fmtUnit(value, unit, 3));
  }
  return (
    <label className="flex-1 flex flex-col gap-tight">
      <SectionLabel>
        {label} ({unitLabel[unit]})
      </SectionLabel>
      <input
        type="number"
        step={unitStep[unit]}
        min={unitMin[unit]}
        value={text}
        onChange={e => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (!Number.isNaN(n) && n > 0) onChange(fromUnit(n, unit));
        }}
        className="w-full px-2 py-1 text-xs border border-border-neutral-light rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  );
}
