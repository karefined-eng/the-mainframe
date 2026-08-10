# The Mainframe — UX Research Notes

Source: web research pass conducted during concept phase, cross-referenced against 2026 dashboard design guidance (Linear/Stripe/Grafana/Vercel-style patterns, UXPin, AuFaitUX). These are the findings that shaped the UI structure in the project brief — kept here so the build agent (or user) can see the reasoning if a layout question comes up later.

## Findings applied to The Mainframe

1. **Sidebar navigation, 240–280px, collapsible to a ~64px icon rail** — standard pattern across modern dashboard tools that survive daily use. Applied directly: the 5 domains live in this sidebar.

2. **Metric/summary strip capped at 4–6 items** — users reliably register the first 3–5 items in a repeated row and disengage after that. Applied: the collapsed dashboard view shows exactly the 5 domain summary cards, not sub-items within them.

3. **Progressive disclosure** — collapsible sections, drill-down from summary to detail, tabbed sub-views, rather than showing everything at once. This is the direct fix for the concern raised in concept discussion: seeing multiple unfinished items (e.g. incomplete papers) at a glance can be demotivating. Applied: domains open collapsed (count only), expand on click.

4. **F-pattern scanning** — users sweep the top of the screen first, then drift down the left side in shorter horizontal movements. Applied: period switcher (Daily/Weekly/Monthly) sits top-left; domain nav occupies the left rail.

5. **Grouping and visual hierarchy** — related items grouped into clearly labeled sections, 3–5 most important items reading first before supporting detail. Applied: each domain's expanded view should surface in-progress/near-deadline items first, completed items pushed lower or into a secondary tab.

6. **Both color themes "from day one" is standard advice** — noted, but explicitly deprioritized for v1. Dark mode is the only mode being built now; this is a conscious deviation from general best practice in favor of shipping speed, matching the user's stated preference for dark UI and the reference app icon.

## Explicitly not pursued from research

- AI-driven personalization / predictive analytics — irrelevant to a manual personal-tracking tool at this scale.
- Real-time multi-collaborator presence indicators — single-user app, not applicable.
- Chart-heavy KPI visualizations (bar/line/scatter) — The Mainframe is a list/task system, not an analytics product. No charts in v1.

## Reference points worth manually browsing before finalizing component design

- nicelydone.club/tags/task-management-dashboard — large library of real task-dashboard UI screenshots, useful for concrete component-level reference (card shapes, spacing, list-item design) beyond what's described here in text.
