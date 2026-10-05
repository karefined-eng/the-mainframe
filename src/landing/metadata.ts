/**
 * Landing-page page metadata (title, description, canonical, Open Graph, Twitter).
 *
 * Applies tags only while the landing page is mounted and removes the ones it
 * added on unmount, so the in-app surface is not polluted with marketing tags.
 * Open Graph tags use relative URLs because no stable public canonical URL has
 * been configured yet; replace SITE_ORIGIN once one exists.
 */

import { pageMeta } from "./content";

const SITE_ORIGIN = ""; // e.g. "https://mainframe.example" once a stable URL exists.

function upsertMeta(attribute: "name" | "property", key: string, value: string, created: HTMLElement[]) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
    created.push(tag);
  }
  tag.setAttribute("content", value);
}

function upsertLink(rel: string, href: string, created: HTMLElement[]) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
    created.push(tag);
  }
  tag.setAttribute("href", href);
}

export function applyLandingMetadata(): () => void {
  const created: HTMLElement[] = [];
  const previousTitle = document.title;

  document.title = pageMeta.title;
  document.documentElement.lang = "en";

  upsertMeta("name", "description", pageMeta.description, created);
  upsertMeta("name", "keywords", pageMeta.keywords.join(", "), created);
  upsertMeta("name", "application-name", "The Mainframe", created);
  upsertMeta("name", "theme-color", "#0E0E10", created);

  upsertMeta("property", "og:type", "website", created);
  upsertMeta("property", "og:site_name", "The Mainframe", created);
  upsertMeta("property", "og:title", pageMeta.title, created);
  upsertMeta("property", "og:description", pageMeta.description, created);
  upsertMeta("property", "og:url", `${SITE_ORIGIN}/welcome`, created);
  upsertMeta("property", "og:image", `${SITE_ORIGIN}/landing/social-preview.svg`, created);

  upsertMeta("name", "twitter:card", "summary_large_image", created);
  upsertMeta("name", "twitter:title", pageMeta.title, created);
  upsertMeta("name", "twitter:description", pageMeta.description, created);
  upsertMeta("name", "twitter:image", `${SITE_ORIGIN}/landing/social-preview.svg`, created);

  upsertLink("canonical", `${SITE_ORIGIN}/welcome`, created);

  // No version meta tag: the package version is an internal build identifier, not
  // a shipped release, so advertising it here would be an unsupported claim.
  // Structured data likewise stays off until download URLs and platform claims
  // are stable (see docs/LANDING_PAGE_PLAN.md, "SEO and metadata").

  return () => {
    document.title = previousTitle;
    created.forEach((tag) => tag.remove());
  };
}
