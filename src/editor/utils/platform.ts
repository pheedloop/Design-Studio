/** Modifier-key label for menu shortcuts — "⌘" on macOS, "Ctrl+" elsewhere.
 *  Shared by both editors' top bars (previously computed twice, independently,
 *  in TopBar.tsx and BadgeTopBar.tsx). */
const isMac = navigator.platform.toUpperCase().includes("MAC");
export const modKey = isMac ? "⌘" : "Ctrl+";
