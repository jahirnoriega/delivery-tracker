import { parseISODate } from "./format";

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

export function filterRange(rows, range) {
  if (range === "all") return rows;
  const days = range === "d7" ? 7 : 30;
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));
  return rows.filter((r) => parseISODate(r.date) >= from);
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

  const byDay = Array.from({ length: 7 }, (_, d) =>
    totals(rows.filter((r) => parseISODate(r.date).getDay() === d)),
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
