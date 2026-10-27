import { useMemo, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineCog6Tooth,
  HiOutlineTrophy,
} from "react-icons/hi2";
import { useLocale } from "@/i18n/context";
import { APPS, appInfo, filterRange, hoursBetween, summarize, toCSV } from "@/lib/tracker";
import { formatMoney as money, formatMoneyPrecise as money2, toISODate } from "@/lib/format";

const emptyShift = () => ({
  date: toISODate(),
  app: "uber_eats",
  start: "19:00",
  end: "21:00",
  earnings: "",
  tips: "",
  km: "",
  trips: "",
  notes: "",
});

function Stat({ label, value, sub, accent }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${accent ? "text-brand" : ""}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

/**
 * Presentational tracker. Data comes from props so the same UI serves the
 * private Firebase-backed tracker and the demo with sample data.
 */
export default function TrackerView({ shifts, settings, onAdd, onDelete, onSettings, demo = false }) {
  const { t, locale: lang } = useLocale();
  const [range, setRange] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState(emptyShift);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const data = useMemo(() => summarize(filterRange(shifts, range), settings), [shifts, range, settings]);
  const maxApp = Math.max(1, ...data.byApp.map((a) => a.perHour));
  const maxDay = Math.max(1, ...data.byDay.map((d) => d.perHour));

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const draftHours = hoursBetween(draft.start, draft.end);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await onAdd({
        ...draft,
        hours: draftHours,
        earnings: Number(draft.earnings) || 0,
        tips: Number(draft.tips) || 0,
        km: Number(draft.km) || 0,
        trips: Number(draft.trips) || 0,
        createdAt: Date.now(),
      });
      setDraft({ ...emptyShift(), app: draft.app, date: draft.date });
      setFormOpen(false);
    } catch {
      setErr(t.error);
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const blob = new Blob([toCSV(data.rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `turnos-${toISODate()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {demo && (
            <span className="mb-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              {t.demoBadge}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.appName}</h1>
          <p className="mt-2 max-w-xl text-muted">{t.tagline}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex rounded-xl border border-line bg-surface p-1 text-sm"
          role="tablist"
          aria-label={t.range}
        >
          {["all", "d30", "d7"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 transition ${range === r ? "bg-surface-2 font-medium text-ink" : "text-muted hover:text-ink"}`}
            >
              {t.ranges[r]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="btn btn-ghost"
            aria-expanded={settingsOpen}
          >
            <HiOutlineCog6Tooth /> <span className="hidden sm:inline">{t.settings}</span>
          </button>
          <button onClick={exportCsv} className="btn btn-ghost" disabled={!data.rows.length}>
            <HiOutlineArrowDownTray /> <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>
          <button onClick={() => setFormOpen((o) => !o)} className="btn btn-primary">
            <HiOutlinePlus /> {t.newShift}
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="card grid gap-4 p-5 sm:grid-cols-2">
          <Field label={t.kmPerLiter}>
            <input
              type="number"
              step="0.1"
              min="1"
              className="field"
              value={settings.kmPerLiter}
              onChange={(e) => onSettings({ ...settings, kmPerLiter: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label={`${t.gasPrice} (MXN)`}>
            <input
              type="number"
              step="0.1"
              min="0"
              className="field"
              value={settings.gasPrice}
              onChange={(e) => onSettings({ ...settings, gasPrice: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
      )}

      {formOpen && (
        <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-4">
          <Field label={t.date}>
            <input type="date" required className="field" value={draft.date} onChange={set("date")} />
          </Field>
          <Field label={t.app}>
            <select className="field" value={draft.app} onChange={set("app")}>
              {APPS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.start}>
            <input type="time" required className="field" value={draft.start} onChange={set("start")} />
          </Field>
          <Field label={`${t.end} · ${draftHours} h`}>
            <input type="time" required className="field" value={draft.end} onChange={set("end")} />
          </Field>
          <Field label={`${t.earnings} (MXN)`}>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              className="field"
              value={draft.earnings}
              onChange={set("earnings")}
              placeholder="0"
            />
          </Field>
          <Field label={`${t.tips} (MXN)`}>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="field"
              value={draft.tips}
              onChange={set("tips")}
              placeholder="0"
            />
          </Field>
          <Field label={t.km}>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              className="field"
              value={draft.km}
              onChange={set("km")}
              placeholder="0"
            />
          </Field>
          <Field label={t.trips}>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              className="field"
              value={draft.trips}
              onChange={set("trips")}
              placeholder="0"
            />
          </Field>
          <Field label={t.notes} className="sm:col-span-4">
            <input
              className="field"
              value={draft.notes}
              onChange={set("notes")}
              placeholder={t.notesPlaceholder}
            />
          </Field>
          <div className="flex items-center gap-2 sm:col-span-4">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {t.save}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(false)}>
              {t.cancel}
            </button>
            {err && <p className="text-sm text-bad">{err}</p>}
          </div>
        </form>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label={t.net}
          value={money(data.total.net, lang)}
          sub={`${t.gross} ${money(data.total.gross, lang)}`}
          accent
        />
        <Stat
          label={t.perHour}
          value={money2(data.total.perHour, lang)}
          sub={`${data.total.hours.toFixed(1)} h · ${data.total.shifts} ${t.shifts}`}
        />
        <Stat
          label={t.perKm}
          value={money2(data.total.perKm, lang)}
          sub={`${Math.round(data.total.km)} km`}
        />
        <Stat
          label={t.gas}
          value={money(data.total.gas, lang)}
          sub={`${settings.kmPerLiter} km/L · ${money2(settings.gasPrice, lang)}/L`}
        />
      </div>

      {data.best && (
        <div className="flex items-center gap-3 rounded-2xl border border-good/30 bg-good/10 px-4 py-3 text-sm">
          <HiOutlineTrophy className="h-5 w-5 shrink-0 text-good" />
          <p>
            <strong>{data.best.label}</strong> {t.winner} · {money2(data.best.perHour, lang)}/h
          </p>
        </div>
      )}

      {/* Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">{t.byApp}</h2>
          <div className="mt-5 flex flex-col gap-5">
            {data.byApp.length === 0 && <p className="text-sm text-muted">{t.empty}</p>}
            {data.byApp.map((a) => (
              <div key={a.id}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                    {a.label}
                  </span>
                  <span className="tabular-nums">{money2(a.perHour, lang)}/h</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(2, (a.perHour / maxApp) * 100)}%`, background: a.color }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted tabular-nums">
                  {a.shifts} {t.shifts} · {a.hours.toFixed(1)} h · {money(a.net, lang)} ·{" "}
                  {money2(a.perKm, lang)}/km
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">{t.byDay}</h2>
          <div className="mt-5 flex h-44 items-end gap-2">
            {data.byDay.map((d, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] text-muted tabular-nums">
                  {d.hours > 0 ? Math.round(d.perHour) : ""}
                </span>
                <div
                  className={`w-full rounded-md ${d.hours > 0 ? "bg-brand" : "bg-surface-2"}`}
                  style={{ height: d.hours > 0 ? `${Math.max(4, (d.perHour / maxDay) * 100)}%` : "4%" }}
                  title={`${t.days[i]}: ${money2(d.perHour, lang)}/h`}
                />
                <span className="text-xs text-muted">{t.days[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* History */}
      <section className="card overflow-hidden">
        <h2 className="px-5 pt-5 font-semibold">{t.history}</h2>
        {data.rows.length === 0 ? (
          <p className="p-5 text-sm text-muted">{t.empty}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-2 font-medium">{t.date}</th>
                  <th className="px-2 py-2 font-medium">{t.app}</th>
                  <th className="px-2 py-2 text-right font-medium">{t.hours}</th>
                  <th className="px-2 py-2 text-right font-medium">{t.gross}</th>
                  <th className="px-2 py-2 text-right font-medium">km</th>
                  <th className="px-2 py-2 text-right font-medium">{t.net}</th>
                  <th className="px-2 py-2 text-right font-medium">{t.perHour}</th>
                  <th className="px-5 py-2" />
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/50">
                    <td className="px-5 py-3 tabular-nums">
                      {r.date}
                      <span className="block text-xs text-muted">
                        {r.start}–{r.end}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: appInfo(r.app).color }} />
                        {appInfo(r.app).label}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">{r.hours.toFixed(1)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{money(r.gross, lang)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{r.km}</td>
                    <td className="px-2 py-3 text-right font-medium tabular-nums">{money(r.net, lang)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{money2(r.perHour, lang)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => window.confirm(t.confirmDelete) && onDelete(r.id)}
                        className="rounded-lg p-1.5 text-muted hover:bg-bad/10 hover:text-bad"
                        aria-label={t.delete}
                      >
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
