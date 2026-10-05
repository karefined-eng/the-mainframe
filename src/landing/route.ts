/**
 * Route detection for the public landing page.
 *
 * The landing page is a presentation route beside the app, never the primary
 * route (see docs/LANDING_PAGE_PLAN.md). Both spellings are supported so the
 * page works on hosts that cannot rewrite arbitrary paths to index.html:
 *
 *   - hash form:    /#/welcome      (works everywhere, no server config)
 *   - path form:    /welcome        (needs a rewrite to index.html)
 */

export const LANDING_PATH = "/welcome";
export const LANDING_HASH = "#/welcome";

export type Route = "landing" | "app";

export function readRoute(loc: Pick<Location, "pathname" | "hash"> = window.location): Route {
  const path = loc.pathname.replace(/\/+$/, "").toLowerCase();
  const hash = loc.hash.replace(/\/+$/, "").toLowerCase();

  if (hash === LANDING_HASH) return "landing";
  if (path.endsWith(LANDING_PATH)) return "landing";

  return "app";
}

export function landingUrl(): string {
  return LANDING_HASH;
}
