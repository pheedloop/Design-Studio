import { useState } from "react";
import { SectionLabel } from "@/editor/components/ui";
import {
  fmtUnit,
  fromUnit,
  syncDimText,
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
  const [text, setText] = useState(() => fmtUnit(value, unit, 3));
  const [synced, setSynced] = useState({ value, unit });
  if (synced.value !== value || synced.unit !== unit) {
    setSynced({ value, unit });
    setText(syncDimText(text, value, unit));
  }
  return (
    <label className="flex-1 flex flex-col gap-tight">
      <SectionLabel>{label}</SectionLabel>
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
        className="w-full px-xxs py-xxxs text-xs border border-border-neutral-light rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  );
}
