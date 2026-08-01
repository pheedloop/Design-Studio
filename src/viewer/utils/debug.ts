/**
 * Whether the viewer should log its internals.
 *
 * `import.meta.env.DEV` is not enough: the published library is built in
 * production mode, so a DEV-guarded log is stripped and never reaches a host
 * that is itself running in dev. Hosts that need the diagnostics — a webview,
 * where the console is the only window in — opt in at runtime instead.
 */
declare global {
  interface Window {
    __PL_VIEWER_DEBUG__?: boolean;
  }
}

export function isViewerDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  return typeof window !== "undefined" && window.__PL_VIEWER_DEBUG__ === true;
}
