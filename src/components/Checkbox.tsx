export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-xxs cursor-pointer select-none">
      <input
        type="checkbox"
        className="accent-primary-600"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="text-xs text-text-body">{label}</span>
    </label>
  );
}
