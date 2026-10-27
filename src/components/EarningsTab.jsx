import { useMemo } from "react";
import { useLocale } from "@/i18n/context";
import { formatDayDate, formatMoney as money, formatShortDate, toISODate } from "@/lib/format";
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

/** Net per week for the last 8 weeks, with the gas cost stacked on top (bar height = gross). */
function WeeklyChart({ weeks }) {
  const { t, locale } = useLocale();
  const max = Math.max(1, ...weeks.map((w) => w.gross));

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
      <div className="mt-5 flex h-52 items-end gap-2 sm:gap-3">
        {weeks.map((week, i) => {
          const current = i === weeks.length - 1;
          const netHeight = (Math.max(0, week.net) / max) * 100;
          const gasHeight = (week.gas / max) * 100;
          return (
            <div
              key={week.from.toISOString()}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              <span className="mb-1 text-[10px] text-muted tabular-nums">
                {week.shifts ? money(week.net, locale) : ""}
              </span>
              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-md"
                style={{ height: `${Math.max(week.shifts ? 4 : 2, netHeight + gasHeight)}%` }}
                title={`${formatShortDate(week.from, locale)} · ${t.net} ${money(week.net, locale)} · ${t.gas} ${money(week.gas, locale)}`}
              >
                {week.shifts ? (
                  <>
                    <div className="bg-bad/50" style={{ flexGrow: gasHeight }} />
                    <div className={current ? "bg-brand" : "bg-brand/70"} style={{ flexGrow: netHeight }} />
                  </>
                ) : (
                  <div className="h-full bg-surface-2" />
                )}
              </div>
              <span
                className={`mt-1.5 text-[10px] sm:text-xs ${current ? "font-medium text-ink" : "text-muted"}`}
              >
                {formatShortDate(week.from, locale)}
              </span>
            </div>
          );
        })}
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
export default function EarningsTab({ shifts, rows, settings }) {
  const { t, locale } = useLocale();
  const e = t.earningsTab;
  const summary = useMemo(() => earningsSummary(shifts, settings), [shifts, settings]);

  return (
    <>
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

      <WeeklyChart weeks={summary.weeks} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyChart days={summary.days} />
        <Breakdown rows={rows} />
      </div>
    </>
  );
}
