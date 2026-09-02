/**
 * Temporary stub for the seatplanner editor/viewer. Step one only scaffolds
 * navigation; the real seatplanner (tables, no tiers) lands in later steps.
 */
export function SeatplannerPlaceholder({ mode }: { mode: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-xxs bg-surface-neutral text-center">
      <div className="text-2xl font-semibold text-text-body">Seatplanner</div>
      <div className="text-sm text-text-caption">
        The seatplanner {mode} is coming soon.
      </div>
    </div>
  );
}
