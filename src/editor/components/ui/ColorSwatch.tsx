interface ColorSwatchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorSwatch({ label, value, onChange }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-text-caption">{label}</span>
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-6 h-6 border border-gray-300 rounded cursor-pointer p-0"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-[72px] px-1.5 py-0.5 text-[11px] font-mono border border-gray-200 rounded bg-white"
      />
    </div>
  );
}
