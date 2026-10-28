import { parseISODate, toISODate } from "./format";

// Pure helpers for the delivery tracker (no React), so they are easy to test.

export const APPS = [
  { id: "uber_eats", label: "Uber Eats", color: "#06c167" },
  { id: "amazon_flex", label: "Amazon Flex", color: "#ff9900" },
  { id: "didi_food", label: "DiDi Food", color: "#fc4c02" },
  { id: "other", label: "Other", color: "#8b8b96" },
];
export const appInfo = (id) => APPS.find((a) => a.id === id) ?? APPS[APPS.length - 1];

export const DEFAULT_SETTINGS = { kmPerLiter: 10.4, gasPrice: 24 };

/** Hours between two "HH:MM" strings; handles shifts that cross midnight. */
export function hoursBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

export function shiftHours(s) {
  const h = Number(s.hours);
  return h > 0 ? h : hoursBetween(s.start, s.end);
}

export function enrichShift(shift, settings) {
  const hours = shiftHours(shift);
  const earnings = Number(shift.earnings) || 0;
  const tips = Number(shift.tips) || 0;
  const km = Number(shift.km) || 0;
  const gross = earnings + tips;
  const gas = settings.kmPerLiter > 0 ? (km / settings.kmPerLiter) * settings.gasPrice : 0;
  const net = gross - gas;
  return {
    ...shift,
    hours,
    km,
    gross,
    gas,
    net,
    perHour: hours > 0 ? net / hours : 0,
    perKm: km > 0 ? net / km : 0,
  };
}

function totals(rows) {
  const t = rows.reduce(
    (a, r) => ({
      shifts: a.shifts + 1,
      hours: a.hours + r.hours,
      km: a.km + r.km,
      gross: a.gross + r.gross,
      gas: a.gas + r.gas,
      net: a.net + r.net,
      trips: a.trips + (Number(r.trips) || 0),
    }),
    { shifts: 0, hours: 0, km: 0, gross: 0, gas: 0, net: 0, trips: 0 },
  );
  t.perHour = t.hours > 0 ? t.net / t.hours : 0;
  t.perKm = t.km > 0 ? t.net / t.km : 0;
  return t;
}

/** `range` is "all" or the Monday of a week as "YYYY-MM-DD". */
export function filterRange(rows, range) {
  if (range === "all") return rows;
  const from = parseISODate(range);
  const to = addDays(from, 7);
  return rows.filter((r) => inRange(r, from, to));
}

export function summarize(shifts, settings) {
  const rows = shifts
    .map((s) => enrichShift(s, settings))
    .sort((a, b) =>
      a.date === b.date ? (b.start || "").localeCompare(a.start || "") : b.date.localeCompare(a.date),
    );

  const byApp = APPS.map((a) => ({
    ...a,
    ...totals(rows.filter((r) => (r.app || "other") === a.id)),
  })).filter((a) => a.shifts > 0);

  // Monday first, to match weeks that start on Monday.
  const byDay = Array.from({ length: 7 }, (_, d) =>
    totals(rows.filter((r) => weekdayIndex(parseISODate(r.date)) === d)),
  );

  const best = [...byApp].sort((a, b) => b.perHour - a.perHour)[0];

  return { rows, total: totals(rows), byApp, byDay, best: byApp.length > 1 ? best : null };
}

export function toCSV(rows) {
  const head = [
    "date",
    "app",
    "start",
    "end",
    "hours",
    "earnings",
    "tips",
    "km",
    "trips",
    "gas",
    "net",
    "net_per_hour",
    "notes",
  ];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.date,
      appInfo(r.app).label,
      r.start,
      r.end,
      r.hours,
      r.earnings,
      r.tips,
      r.km,
      r.trips,
      r.gas.toFixed(2),
      r.net.toFixed(2),
      r.perHour.toFixed(2),
      r.notes,
    ]
      .map(esc)
      .join(","),
  );
  return [head.join(","), ...lines].join("\n");
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** 0 = Monday … 6 = Sunday. */
const weekdayIndex = (date) => (date.getDay() + 6) % 7;

/** Calendar-day offset (safe across DST changes, unlike adding milliseconds). */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Monday of the week that contains `date` (weeks start on Monday). */
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - weekdayIndex(d));
  return d;
}

/** "YYYY-MM-DD" of the Monday `offset` weeks from the current week (0 = this week, -1 = last week). */
export const weekKey = (offset = 0, today = new Date()) => toISODate(addDays(startOfWeek(today), offset * 7));

/** The week before the given week key. */
export const previousWeekKey = (key) => toISODate(addDays(parseISODate(key), -7));

/** Every week from the current one back to the week of the oldest shift, newest first. */
export function weekKeys(shifts, today = new Date()) {
  const current = startOfWeek(today);
  const oldest = shifts.reduce((min, s) => (s.date < min ? s.date : min), toISODate(current));
  const keys = [];
  for (let d = current; d >= startOfWeek(parseISODate(oldest)); d = addDays(d, -7)) keys.push(toISODate(d));
  return keys;
}

const inRange = (row, from, to) => {
  const d = parseISODate(row.date);
  return d >= from && d < to;
};

/** Percent change from `previous` to `current`, or null when there's nothing to compare. */
export function percentChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Everything the Earnings dashboard needs, computed from all shifts
 * (it ignores the period filter so comparisons always have history).
 */
export function earningsSummary(shifts, settings, today = new Date()) {
  const rows = shifts.map((s) => enrichShift(s, settings));
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart.getTime() + DAY_MS);

  // This week so far vs the same days of last week (weeks start on Monday).
  const weekStart = startOfWeek(todayStart);
  const prevWeekStart = new Date(weekStart.getTime() - 7 * DAY_MS);
  const prevWeekCutoff = new Date(tomorrow.getTime() - 7 * DAY_MS);
  const thisWeek = totals(rows.filter((r) => inRange(r, weekStart, tomorrow)));
  const lastWeek = totals(rows.filter((r) => inRange(r, prevWeekStart, prevWeekCutoff)));

  // This month so far vs the same days of last month, so the comparison is fair.
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const prevMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, 1);
  const sameDayLastMonth = new Date(
    prevMonthStart.getFullYear(),
    prevMonthStart.getMonth(),
    todayStart.getDate() + 1,
  );
  const prevMonthCutoff = sameDayLastMonth < monthStart ? sameDayLastMonth : monthStart;
  const thisMonth = totals(rows.filter((r) => inRange(r, monthStart, tomorrow)));
  const lastMonth = totals(rows.filter((r) => inRange(r, prevMonthStart, prevMonthCutoff)));

  // Last 8 weeks, oldest first.
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const from = addDays(weekStart, -(7 - i) * 7);
    const to = addDays(from, 7);
    return { from, key: toISODate(from), ...totals(rows.filter((r) => inRange(r, from, to))) };
  });

  // Last 14 days, oldest first.
  const days = Array.from({ length: 14 }, (_, i) => {
    const from = new Date(todayStart.getTime() - (13 - i) * DAY_MS);
    const to = new Date(from.getTime() + DAY_MS);
    return { date: from, ...totals(rows.filter((r) => inRange(r, from, to))) };
  });

  // Best single day ever, by net.
  const byDate = new Map();
  for (const r of rows) byDate.set(r.date, (byDate.get(r.date) ?? 0) + r.net);
  let bestDay = null;
  for (const [date, net] of byDate) if (!bestDay || net > bestDay.net) bestDay = { date, net };

  const all = totals(rows);
  const activeDays = byDate.size;

  return {
    thisWeek,
    lastWeek,
    thisMonth,
    lastMonth,
    weeks,
    days,
    bestDay,
    activeDays,
    avgPerShift: all.shifts ? all.net / all.shifts : 0,
    avgPerDay: activeDays ? all.net / activeDays : 0,
  };
}
