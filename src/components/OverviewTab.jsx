import { HiOutlineTrophy } from "react-icons/hi2";
import { useLocale } from "@/i18n/context";
import {
  formatMoney as money,
  formatMoneyCompact,
  formatMoneyPrecise as money2,
  formatWeekRange,
} from "@/lib/format";
import { percentChange } from "@/lib/tracker";
import { Change, Stat } from "./ui";

/**
 * KPIs, best app, comparison by app and by weekday for the selected period.
 * `previous` is the week before the selected one (null for "all time"), starting on `previousKey`.
 */
export default function OverviewTab({ data, previous, previousKey, settings }) {
  const { t, locale } = useLocale();
  const maxApp = Math.max(1, ...data.byApp.map((a) => a.perHour));
  const maxDay = Math.max(1, ...data.byDay.map((d) => d.net));
  // Lower gas spend is good, so its pill is colored the other way round.
  const change = (key, { invert = false } = {}) =>
    previous && (
      <Change
        value={percentChange(data.total[key], previous.total[key])}
        label={previous.total.shifts ? t.vsPrevWeek : t.noPrevWeek}
        invert={invert}
      />
    );

  return (
    <>
      {previous && (
        <p className="-mb-3 text-xs text-muted sm:hidden">
          {t.comparedWith} {formatWeekRange(previousKey, locale)}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label={t.net}
          value={money(data.total.net, locale)}
          sub={`${t.gross} ${money(data.total.gross, locale)}`}
          accent
        >
          {change("net")}
        </Stat>
        <Stat
          label={t.perHour}
          value={money2(data.total.perHour, locale)}
          sub={`${data.total.hours.toFixed(1)} h · ${data.total.shifts} ${t.shifts}`}
        >
          {change("perHour")}
        </Stat>
        <Stat
          label={t.perKm}
          value={money2(data.total.perKm, locale)}
          sub={`${Math.round(data.total.km)} km`}
        >
          {change("perKm")}
        </Stat>
        <Stat
          label={t.gas}
          value={money(data.total.gas, locale)}
          sub={`${settings.kmPerLiter} km/L · ${money2(settings.gasPrice, locale)}/L`}
        >
          {change("gas", { invert: true })}
        </Stat>
      </div>

      {data.best && (
        <div className="flex items-center gap-3 rounded-2xl border border-good/30 bg-good/10 px-4 py-3 text-sm">
          <HiOutlineTrophy className="size-5 shrink-0 text-good" />
          <p>
            <strong>{data.best.label}</strong> {t.winner} · {money2(data.best.perHour, locale)}/h
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">{t.byApp}</h2>
          <div className="mt-5 flex flex-col gap-5">
            {data.byApp.length === 0 && <p className="text-sm text-muted">{t.empty}</p>}
            {data.byApp.map((app) => (
              <div key={app.id}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="size-2.5 rounded-full" style={{ background: app.color }} />
                    {app.label}
                  </span>
                  <span className="tabular-nums">{money2(app.perHour, locale)}/h</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(2, (app.perHour / maxApp) * 100)}%`, background: app.color }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted tabular-nums">
                  {app.shifts} {t.shifts} · {app.hours.toFixed(1)} h · {money(app.net, locale)} ·{" "}
                  {money2(app.perKm, locale)}/km
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">{t.byDay}</h2>
          <div className="mt-5 flex h-44 items-end gap-2">
            {data.byDay.map((day, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] whitespace-nowrap text-muted tabular-nums">
                  {day.shifts > 0 ? formatMoneyCompact(day.net) : ""}
                </span>
                <div
                  className={`w-full rounded-md ${day.shifts > 0 ? "bg-brand" : "bg-surface-2"}`}
                  style={{
                    height: day.shifts > 0 ? `${Math.max(4, (Math.max(0, day.net) / maxDay) * 100)}%` : "4%",
                  }}
                  title={`${t.days[i]}: ${money(day.net, locale)} · ${money2(day.perHour, locale)}/h`}
                />
                <span className="text-xs text-muted">{t.days[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
