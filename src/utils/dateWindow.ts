export type Period = "daily" | "weekly" | "monthly";

export interface DateRange {
  start: string;
  end: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function dateOnlyOrdinal(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function getPeriodDateRange(period: Period, now = new Date()): DateRange {
  let start: Date;
  let end: Date;

  if (period === "daily") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = start;
  } else if (period === "weekly") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysSinceMonday = (today.getDay() + 6) % 7;
    start = new Date(today);
    start.setDate(today.getDate() - daysSinceMonday);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  return { start: localDateString(start), end: localDateString(end) };
}

export function daysUntilDate(value: string | null | undefined, now = new Date()): number | null {
  const target = parseDateOnly(value);
  if (!target) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dateOnlyOrdinal(target) - dateOnlyOrdinal(today);
}

/**
 * Keep undated items available in every period. Active overdue items also stay
 * visible in every period; completed overdue items only appear in their date window.
 */
export function isVisibleInPeriod(
  targetDate: string | null | undefined,
  period: Period,
  now = new Date(),
  keepOverdue = true,
): boolean {
  const target = parseDateOnly(targetDate);
  if (!target) return true;

  const targetValue = localDateString(target);
  const todayValue = localDateString(now);
  if (keepOverdue && targetValue < todayValue) return true;

  const range = getPeriodDateRange(period, now);
  return targetValue >= range.start && targetValue <= range.end;
}

export function isOverdueDate(value: string | null | undefined, now = new Date()): boolean {
  return (daysUntilDate(value, now) ?? 0) < 0;
}

export function formatTargetDate(value: string): string {
  const date = parseDateOnly(value);
  if (!date) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function parseUtcTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const normalized = hasZone
    ? trimmed
    : `${trimmed.replace(" ", "T")}Z`;
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function daysSinceTimestamp(value: string | null | undefined, now = new Date()): number {
  const timestamp = parseUtcTimestamp(value);
  if (timestamp === null) return 0;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / DAY_MS));
}

export function isTimestampAfter(value: string | null | undefined, reference: string | null | undefined): boolean {
  const valueTimestamp = parseUtcTimestamp(value);
  const referenceTimestamp = parseUtcTimestamp(reference);
  return valueTimestamp !== null && referenceTimestamp !== null && valueTimestamp > referenceTimestamp;
}
