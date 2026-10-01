import assert from "node:assert/strict";
import test from "node:test";
import type { BaseItem, DomainKey } from "../src/App";
import { buildDashboardModel } from "../src/engine/dashboardModel.ts";
import { computeUrgencyScore, getUrgencyBand } from "../src/engine/urgencyScoring.ts";
import { getPeriodDateRange, isVisibleInPeriod } from "../src/utils/dateWindow.ts";

const now = new Date(2026, 8, 30, 12, 0, 0);

function makeItem(
  id: number,
  overrides: Partial<BaseItem> = {},
): BaseItem {
  return {
    id,
    title: `Item ${id}`,
    notes: null,
    status: "not_started",
    created_at: "2026-09-01 12:00:00",
    updated_at: "2026-09-29 12:00:00",
    target_date: null,
    target_time: null,
    raw_import_text: null,
    ...overrides,
  };
}

test("period windows use the local calendar day, Monday-start week, and month", () => {
  assert.deepEqual(getPeriodDateRange("daily", now), { start: "2026-09-30", end: "2026-09-30" });
  assert.deepEqual(getPeriodDateRange("weekly", now), { start: "2026-09-28", end: "2026-10-04" });
  assert.deepEqual(getPeriodDateRange("monthly", now), { start: "2026-09-01", end: "2026-09-30" });
});

test("period visibility retains undated and active overdue items while filtering other dates", () => {
  assert.equal(isVisibleInPeriod(null, "daily", now), true);
  assert.equal(isVisibleInPeriod("2026-09-20", "daily", now, true), true);
  assert.equal(isVisibleInPeriod("2026-09-20", "daily", now, false), false);
  assert.equal(isVisibleInPeriod("2026-10-01", "daily", now), false);
  assert.equal(isVisibleInPeriod("2026-10-01", "weekly", now), true);
  assert.equal(isVisibleInPeriod("2026-10-01", "monthly", now), false);
});

test("dashboard urgency reuses the reminder thresholds and action-trigger discount", () => {
  const dueSoon = makeItem(20, {
    target_date: "2026-10-10",
    updated_at: "2026-09-29 12:00:00",
  });
  const planned = { ...dueSoon, action_trigger: "After class, open the project" };

  assert.equal(computeUrgencyScore(dueSoon, "certifications", now), 3);
  assert.equal(computeUrgencyScore(planned, "certifications", now), 2);
  assert.equal(getUrgencyBand(3, "balanced"), "gentle");
  assert.equal(getUrgencyBand(2, "balanced"), "dormant");
  assert.equal(getUrgencyBand(2, "intensive"), "gentle");
});

test("dashboard combines urgency across domains and summarizes changed and overdue work", () => {
  const snapshots = [
    {
      key: "certifications" as DomainKey,
      label: "Certifications",
      items: [
        makeItem(1, { title: "Course deadline", target_date: "2026-09-20", updated_at: "2026-09-20 12:00:00" }),
        makeItem(2, { title: "Changed recently", updated_at: "2026-09-29 12:00:00" }),
        makeItem(3, { title: "Completed", status: "done", target_date: "2026-09-01", updated_at: "2026-09-20 12:00:00" }),
      ],
    },
    {
      key: "build_ideas" as DomainKey,
      label: "Build Ideas",
      items: [
        makeItem(4, {
          title: "Planned build",
          target_date: "2026-10-01",
          action_trigger: "After class, open the project",
          updated_at: "2026-09-29 12:00:00",
        }),
      ],
    },
  ];

  const model = buildDashboardModel(snapshots, "2026-09-25T00:00:00.000Z", "balanced", now);
  assert.equal(model.counts.certifications, 3);
  assert.equal(model.counts.build_ideas, 1);
  assert.equal(model.reentry.overdueCount, 1);
  assert.equal(model.reentry.changedCount, 2);
  assert.deepEqual(model.reentry.overdueItems.map((entry) => entry.item.id), [1]);
  assert.deepEqual(model.reentry.changedItems.map((entry) => entry.item.id), [2, 4]);
  assert.equal(model.hotItems[0]?.item.id, 1);
  assert.match(model.hotItems[0]?.reasons.join(" ") ?? "", /Overdue/);
  assert.equal(model.hotItems.find((entry) => entry.item.id === 4)?.item.action_trigger, "After class, open the project");
});

test("dashboard shortlist is capped at five and first visit does not invent change counts", () => {
  const items = Array.from({ length: 8 }, (_, index) =>
    makeItem(index + 1, {
      title: `Overdue ${index + 1}`,
      target_date: `2026-09-${String(10 + index).padStart(2, "0")}`,
      updated_at: "2026-09-01 12:00:00",
    }),
  );
  const model = buildDashboardModel(
    [{ key: "goals", label: "Goals", items }],
    null,
    "balanced",
    now,
  );

  assert.equal(model.hotItems.length, 5);
  assert.equal(model.reentry.hasPreviousVisit, false);
  assert.equal(model.reentry.changedCount, 0);
  assert.equal(model.reentry.overdueCount, 8);
});
