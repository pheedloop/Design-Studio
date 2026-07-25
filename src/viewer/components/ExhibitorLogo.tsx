import type { Exhibitor } from "../types";

/**
 * Exhibitor logo as a square chip. Non-square logos are contained (never
 * squished). Renders nothing when the exhibitor has no logo — the card falls
 * back to a name-only layout.
 */
export function ExhibitorLogo({
  exhibitor,
  size = "md",
}: {
  exhibitor: Exhibitor;
  size?: "sm" | "md";
}) {
  if (!exhibitor.logo) return null;
  const box = size === "sm" ? "h-14 w-14" : "h-16 w-16";
  return (
    <img
      src={exhibitor.logo}
      alt=""
      className={`${box} rounded-md border border-gray-200 bg-white object-contain p-1`}
    />
  );
}
