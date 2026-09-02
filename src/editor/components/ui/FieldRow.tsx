export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-caption w-10 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
