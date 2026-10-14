/**
 * Route detection for the public landing page.
 *
 * When loaded inside the native Tauri application (Windows/macOS/Linux/Android),
 * the default route is the in-app dashboard ("app").
 *
 * When visited in a standard web browser on the internet (e.g. Vercel or custom domain),
 * the default route is the presentation landing page ("landing") to avoid attempting
 * to load the native SQLite plugin outside of Tauri.
 */

export const LANDING_PATH = "/welcome";
export const LANDING_HASH = "#/welcome";

export type Route = "landing" | "app";

export function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

export function readRoute(loc: Pick<Location, "pathname" | "hash"> = window.location): Route {
  const path = loc.pathname.replace(/\/+$/, "").toLowerCase();
  const hash = loc.hash.replace(/\/+$/, "").toLowerCase();

  if (hash === LANDING_HASH) return "landing";
  if (path.endsWith(LANDING_PATH)) return "landing";

  // Inside the native Tauri app, default to the local app dashboard
  if (isTauriEnvironment()) {
    return "app";
  }

  // In a standard web browser, allow explicit preview via #/app or /app,
  // but otherwise default to the public landing page.
  if (hash === "#/app" || path.endsWith("/app")) {
    return "app";
  }

  return "landing";
}

export function landingUrl(): string {
  return LANDING_HASH;
}
