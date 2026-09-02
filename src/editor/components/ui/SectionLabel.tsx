export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium text-text-subtle uppercase tracking-wide">
      {children}
    </span>
  );
}
