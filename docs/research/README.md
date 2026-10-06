# UX Research Index — The Mainframe

UI and workflow decisions in this project are justified by documented
reasoning, not aesthetics alone. This index maps where the reasoning lives and
summarizes the principles that recur. Deeper sources: the files listed under
"Primary sources".

## Primary sources

- [../03_UX_RESEARCH_NOTES.md](../03_UX_RESEARCH_NOTES.md) — UX notes from the
  original design phase.
- [../04_RESEARCH_AND_PRIOR_ART.md](../04_RESEARCH_AND_PRIOR_ART.md) — prior
  art and research the design leaned on.
- [../11_MARKET_AND_PRODUCT_RESEARCH.md](../11_MARKET_AND_PRODUCT_RESEARCH.md) —
  market and product research.
- [LANDING_PAGE_PLAN.md](../LANDING_PAGE_PLAN.md) — the landing page plan,
  including its factual-claim discipline.
- [../origin.md's living copy](../origin.md) — the psychological intent:
  "Seeing everything unfinished at once can be heavy; the system should help me
  choose and continue, not make the whole list feel like a verdict."

## Recurring principles

1. **Collapsed by default (cognitive load).** The dashboard opens calm —
   nothing unfinished is thrown at the user at once. The system's job is to
   help choose and continue, not to render the whole backlog as a verdict.
2. **Blunt re-entry, not guilt.** The Re-entry panel reports overdue work and
   changes since the last visit factually. It tells you how far behind you are
   instead of hiding it — but states numbers, not judgment.
3. **Suggestion, not queue.** "What's Hot" surfaces a short cross-domain
   shortlist and states *why* each entry surfaced (reasons quoted from
   `src/engine/urgencyScoring.ts`). It is a suggestion the user can ignore, not
   a queue they are failing to clear.
4. **Progressive disclosure of structure.** Plain text in, structured rows out;
   the raw paste stays attached. The transform asserts nothing the user did not
   write (no domain inference, no invented dates) — the interface never
   fabricates understanding.
5. **Honest-surface discipline.** Marketing copy and UI claims must mirror
   verified sources (`content.ts` header lists them). The landing states
   limitations in a dedicated section rather than burying them; trust copy is
   split into guarantees ("what it will not do") and cautions ("what you should
   know") so promises never render in an alarm register.

## When adding UI

Write the psychological reasoning into this folder (one file per decision or a
dated addendum here) before or alongside the implementation, per the global
documentation standard.
