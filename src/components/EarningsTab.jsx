import { useMemo } from "react";
import { useLocale } from "@/i18n/context";
import {
  formatDayDate,
  formatMoney as money,
  formatMoneyCompact,
  formatShortDate,
  formatWeekRange,
  toISODate,
} from "@/lib/format";
import { earningsSummary, percentChange } from "@/lib/tracker";
import { Change, Stat } from "./ui";

function Legend({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map(({ label, className }) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`size-2.5 rounded-sm ${className}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}

/** Sum of the money columns for a list of enriched rows. */
const sumRows = (rows) =>
  rows.reduce(
    (a, r) => ({
      gross: a.gross + r.gross,
      gas: a.gas + r.gas,
      net: a.net + r.net,
      hours: a.hours + r.hours,
      shifts: a.shifts + 1,
    }),
    { gross: 0, gas: 0, net: 0, hours: 0, shifts: 0 },
  );

/**
 * Net per week for the last 8 weeks, with the gas cost stacked on top (bar height = gross).
 * Tapping a bar selects that week for the whole tracker; the selected week's amounts show below.
 */
function WeeklyChart({ weeks, rows, range, onRange }) {
  const { t, locale } = useLocale();
  const max = Math.max(1, ...weeks.map((w) => w.gross));
  const currentKey = weeks[weeks.length - 1].key;
  const selectedKey = range === "all" ? currentKey : range;
  // A week older than the chart still gets its amounts, from the filtered rows.
  const selected = weeks.find((w) => w.key === selectedKey) ?? sumRows(rows);

  const amounts = [
    { label: t.gross, value: money(selected.gross, locale) },
    { label: t.gas, value: `−${money(selected.gas, locale)}`, className: "text-bad" },
    { label: t.netShort, value: money(selected.net, locale), className: "text-brand" },
  ];

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">{t.earningsTab.weekly}</h2>
        <Legend
          items={[
            { label: t.net, className: "bg-brand" },
            { label: t.gas, className: "bg-bad/50" },
          ]}
        />
      </div>
      <p className="mt-1 text-xs text-muted">{t.earningsTab.tapWeek}</p>
      <div className="mt-5 flex h-52 items-end gap-1.5 sm:gap-3">
        {weeks.map((week, i) => {
          const active = week.key === selectedKey;
          // Phones only fit the day number; the month shows on the first bar and when it changes.
          const newMonth = i === 0 || week.from.getMonth() !== weeks[i - 1].from.getMonth();
          const netHeight = (Math.max(0, week.net) / max) * 100;
          const gasHeight = (week.gas / max) * 100;
          return (
            <button
              key={week.key}
              type="button"
              onClick={() => onRange(week.key)}
              aria-pressed={active}
              aria-label={`${t.weekOf} ${formatWeekRange(week.from, locale)}`}
              className={`group flex h-full min-w-0 flex-1 flex-col items-center justify-end rounded-lg transition ${
                active ? "" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* Full amounts collide on narrow screens, so phones get a compact label. */}
              <span className="mb-1 text-[10px] whitespace-nowrap text-muted tabular-nums">
                {week.shifts ? (
                  <>
                    <span className="sm:hidden">{formatMoneyCompact(week.net)}</span>
                    <span className="hidden sm:inline">{money(week.net, locale)}</span>
                  </>
                ) : (
                  ""
                )}
              </span>
              <div
                className={`flex w-full flex-col justify-end overflow-hidden rounded-md ${
                  active ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ height: `${Math.max(week.shifts ? 4 : 2, netHeight + gasHeight)}%` }}
              >
                {week.shifts ? (
                  <>
                    <div className="bg-bad/50" style={{ flexGrow: gasHeight }} />
                    <div className="bg-brand" style={{ flexGrow: netHeight }} />
                  </>
                ) : (
                  <div className="h-full bg-surface-2" />
                )}
              </div>
              <span
                className={`mt-1.5 text-[10px] whitespace-nowrap sm:text-xs ${active ? "font-medium text-ink" : "text-muted"}`}
              >
                <span className="sm:hidden">
                  {newMonth ? formatShortDate(week.from, locale) : week.from.getDate()}
                </span>
                <span className="hidden sm:inline">{formatShortDate(week.from, locale)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-surface-2/60 p-4">
        <p className="text-xs text-muted">
          {t.weekOf} {formatWeekRange(selectedKey, locale)} · {selected.shifts} {t.shifts} ·{" "}
          {selected.hours.toFixed(1)} h
        </p>
        <dl className="mt-2 grid grid-cols-3 gap-2">
          {amounts.map(({ label, value, className = "" }) => (
            <div key={label} className="min-w-0">
              <dt className="truncate text-xs text-muted">{label}</dt>
              <dd className={`text-base font-semibold tabular-nums sm:text-lg ${className}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Net per day for the last 14 days. */
function DailyChart({ days }) {
  const { t, locale } = useLocale();
  const max = Math.max(1, ...days.map((d) => d.net));
  const today = toISODate();

  return (
    <section className="card p-5">
      <h2 className="font-semibold">{t.earningsTab.daily}</h2>
      <div className="mt-5 flex h-40 items-end gap-1 sm:gap-1.5">
        {days.map((day) => {
          const iso = toISODate(day.date);
          const isToday = iso === today;
          return (
            <div key={iso} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div
                className={`w-full rounded ${day.shifts ? (isToday ? "bg-brand" : "bg-brand/70") : "bg-surface-2"}`}
                style={{ height: day.shifts ? `${Math.max(4, (Math.max(0, day.net) / max) * 100)}%` : "3%" }}
                title={`${formatDayDate(day.date, locale)} · ${money(day.net, locale)}`}
              />
              <span
                className={`text-[10px] tabular-nums ${isToday ? "font-semibold text-ink" : "text-muted"}`}
              >
                {day.date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** How gross earnings turn into net: app pay + tips − gas = net, for the selected period. */
function Breakdown({ rows }) {
  const { t, locale } = useLocale();
  const sum = (key) => rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
  const earnings = sum("earnings");
  const tips = sum("tips");
  const gas = sum("gas");
  const gross = earnings + tips;
  const net = gross - gas;
  const kept = gross > 0 ? Math.round((net / gross) * 100) : 0;

  const lines = [
    { label: t.earningsTab.appPay, value: earnings, className: "bg-brand/70" },
    { label: t.tips, value: tips, className: "bg-mint" },
    { label: t.gas, value: -gas, className: "bg-bad/60" },
  ];

  return (
    <section className="card p-5">
      <h2 className="font-semibold">{t.earningsTab.breakdown}</h2>
      {gross === 0 ? (
        <p className="mt-4 text-sm text-muted">{t.empty}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            {t.earningsTab.keptBefore} <strong className="text-ink">{kept}%</strong> {t.earningsTab.keptAfter}
          </p>
          <ul className="mt-5 flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.label}>
                <div className="flex justify-between text-sm">
                  <span>{line.label}</span>
                  <span className="tabular-nums">
                    {line.value < 0 ? "−" : ""}
                    {money(Math.abs(line.value), locale)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full ${line.className}`}
                    style={{ width: `${(Math.abs(line.value) / gross) * 100}%` }}
                  />
                </div>
              </li>
            ))}
            <li className="flex justify-between border-t border-line pt-3 font-semibold">
              <span>{t.earningsTab.youKeep}</span>
              <span className="text-brand tabular-nums">{money(net, locale)}</span>
            </li>
          </ul>
        </>
      )}
    </section>
  );
}

/** "Earnings" dashboard: week and month comparisons, trends and where the money goes. */
export default function EarningsTab({ shifts, rows, settings, range, onRange }) {
  const { t, locale } = useLocale();
  const e = t.earningsTab;
  const summary = useMemo(() => earningsSummary(shifts, settings), [shifts, settings]);

  return (
    <>
      <p className="-mb-3 text-xs text-muted sm:hidden">{e.compareNote}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={e.thisWeek} value={money(summary.thisWeek.net, locale)} accent>
          <Change
            value={percentChange(summary.thisWeek.net, summary.lastWeek.net)}
            label={summary.lastWeek.shifts ? e.vsLastWeek : e.noLastWeek}
          />
        </Stat>
        <Stat label={e.thisMonth} value={money(summary.thisMonth.net, locale)}>
          <Change
            value={percentChange(summary.thisMonth.net, summary.lastMonth.net)}
            label={summary.lastMonth.shifts ? e.vsLastMonth : e.noLastMonth}
          />
        </Stat>
        <Stat
          label={e.avgPerShift}
          value={money(summary.avgPerShift, locale)}
          sub={`${money(summary.avgPerDay, locale)} ${e.perWorkedDay} · ${summary.activeDays} ${e.days}`}
        />
        <Stat
          label={e.bestDay}
          value={summary.bestDay ? money(summary.bestDay.net, locale) : "—"}
          sub={summary.bestDay ? formatDayDate(summary.bestDay.date, locale) : ""}
        />
      </div>

      <WeeklyChart weeks={summary.weeks} rows={rows} range={range} onRange={onRange} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyChart days={summary.days} />
        <Breakdown rows={rows} />
      </div>
    </>
  );
}
