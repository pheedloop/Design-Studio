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

const parseNumber = (text: string) => (text.trim() === "" ? NaN : Number(text));

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
  error,
}: {
  label: string;
  /** Value in inches. */
  value: number;
  unit: Unit;
  /** Reports every edit in inches, NaN when not a number. */
  onChange: (inches: number) => void;
  error?: string;
}) {
  const [text, setText] = useState(() => fmtUnit(value, unit, 3));
  const [synced, setSynced] = useState({ value, unit });
  if (!Object.is(synced.value, value) || synced.unit !== unit) {
    setSynced({ value, unit });
    setText(syncDimText(text, value, unit));
  }
  return (
    <LabelledInput
      label={label}
      text={text}
      step={unitStep[unit]}
      min={unitMin[unit]}
      error={error}
      onTextChange={next => {
        setText(next);
        onChange(fromUnit(parseNumber(next), unit));
      }}
    />
  );
}

/** Reports every edit, NaN when blank, so the caller can validate it. */
export function NumberField({
  label,
  value,
  step,
  onChange,
  error,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  const [text, setText] = useState(() => String(value));
  if (!Object.is(parseNumber(text), value) && !Number.isNaN(value)) {
    setText(String(value));
  }
  return (
    <LabelledInput
      label={label}
      text={text}
      step={step}
      min={0}
      error={error}
      onTextChange={next => {
        setText(next);
        onChange(parseNumber(next));
      }}
    />
  );
}

function LabelledInput({
  label,
  text,
  step,
  min,
  error,
  onTextChange,
}: {
  label: string;
  text: string;
  step: number;
  min: number;
  error?: string;
  onTextChange: (text: string) => void;
}) {
  return (
    <label className="flex-1 flex flex-col gap-tight">
      <SectionLabel>{label}</SectionLabel>
      <input
        type="number"
        step={step}
        min={min}
        value={text}
        onChange={e => onTextChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`w-full px-xxs py-xxxs text-xs border ${error ? "border-red-600" : "border-border-neutral-light"} rounded bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
