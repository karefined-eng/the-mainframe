/**
 * Route detection for the public landing page.
 *
 * The landing page is a presentation route beside the app, never the primary
 * route inside the packaged app (see docs/LANDING_PAGE_PLAN.md). Both spellings
 * are supported so the page works on hosts that cannot rewrite arbitrary paths
 * to index.html:
 *
 *   - hash form:    /#/welcome      (works everywhere, no server config)
 *   - path form:    /welcome        (needs a rewrite to index.html)
 *
 * Outside Tauri (the deployed marketing site) the app has no database or IPC,
 * so every path resolves to the landing page: a public visitor can never reach
 * an empty application shell. Inside Tauri the unchanged hash/path rules apply,
 * so the packaged app still opens straight into the dashboard.
 */

export const LANDING_PATH = "/welcome";
export const LANDING_HASH = "#/welcome";

export type Route = "landing" | "app";

function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !== "undefined"
  );
}

export function readRoute(loc: Pick<Location, "pathname" | "hash"> = window.location): Route {
  if (!isTauri()) return "landing";

  const path = loc.pathname.replace(/\/+$/, "").toLowerCase();
  const hash = loc.hash.replace(/\/+$/, "").toLowerCase();

  if (hash === LANDING_HASH) return "landing";
  if (path.endsWith(LANDING_PATH)) return "landing";

  return "app";
}

export function landingUrl(): string {
  return LANDING_HASH;
}
