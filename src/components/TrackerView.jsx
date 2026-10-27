import { useMemo, useState } from "react";
import { HiOutlineArrowDownTray, HiOutlineCog6Tooth, HiOutlinePlus } from "react-icons/hi2";
import { useLocale } from "@/i18n/context";
import { toISODate } from "@/lib/format";
import { filterRange, summarize, toCSV } from "@/lib/tracker";
import EarningsTab from "./EarningsTab";
import HistoryTable from "./HistoryTable";
import OverviewTab from "./OverviewTab";
import ShiftForm from "./ShiftForm";
import { Field } from "./ui";

const TABS = ["overview", "earnings"];
const RANGES = ["all", "d30", "d7"];

/** Segmented control used for the tabs and the period filter. */
function Segmented({ options, value, onChange, labels, ariaLabel }) {
  return (
    <div
      className="flex w-full rounded-xl border border-line bg-surface p-1 text-sm sm:inline-flex sm:w-auto"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={value === option}
          onClick={() => onChange(option)}
          className={`flex-1 rounded-lg px-3 py-1.5 whitespace-nowrap transition sm:flex-none ${
            value === option ? "bg-surface-2 font-medium text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}

/**
 * The whole tracker UI. Data and persistence come from props, so the same view serves
 * the private Firebase-backed tracker and the demo with sample data.
 */
export default function TrackerView({
  shifts,
  settings,
  onAdd,
  onUpdate,
  onDelete,
  onSettings,
  demo = false,
}) {
  const { t } = useLocale();
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Form state: null (closed), { mode: "add", lastApp } or { mode: "edit", shift }.
  const [form, setForm] = useState(null);
  const [lastApp, setLastApp] = useState("uber_eats");

  const data = useMemo(() => summarize(filterRange(shifts, range), settings), [shifts, range, settings]);

  async function handleSubmit(shift) {
    if (form?.mode === "edit") {
      const original = form.shift;
      await onUpdate(original.id, {
        ...shift,
        createdAt: original.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      await onAdd({ ...shift, createdAt: Date.now() });
      setLastApp(shift.app);
    }
    setForm(null);
  }

  function exportCsv() {
    const blob = new Blob([toCSV(data.rows)], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shifts-${toISODate()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {demo && (
          <span className="mb-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            {t.demoBadge}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.appName}</h1>
        <p className="mt-2 max-w-xl text-muted">{t.tagline}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented options={TABS} value={tab} onChange={setTab} labels={t.tabs} ariaLabel={t.view} />
        <Segmented options={RANGES} value={range} onChange={setRange} labels={t.ranges} ariaLabel={t.range} />
        <div className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            className="btn btn-ghost"
            aria-expanded={settingsOpen}
          >
            <HiOutlineCog6Tooth /> <span className="hidden sm:inline">{t.settings}</span>
          </button>
          <button type="button" onClick={exportCsv} className="btn btn-ghost" disabled={!data.rows.length}>
            <HiOutlineArrowDownTray /> <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>
          <button
            type="button"
            onClick={() => setForm(form?.mode === "add" ? null : { mode: "add" })}
            className="btn btn-primary flex-1 sm:flex-none"
          >
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

      {form && (
        <ShiftForm
          // A new key resets the form when switching between shifts or modes.
          key={form.mode === "edit" ? form.shift.id : "new"}
          editing={form.mode === "edit"}
          initial={form.mode === "edit" ? form.shift : { app: lastApp }}
          onSubmit={handleSubmit}
          onCancel={() => setForm(null)}
        />
      )}

      {tab === "overview" ? (
        <OverviewTab data={data} settings={settings} />
      ) : (
        <EarningsTab shifts={shifts} rows={data.rows} settings={settings} />
      )}

      <HistoryTable
        rows={data.rows}
        editingId={form?.mode === "edit" ? form.shift.id : null}
        onEdit={(row) => setForm({ mode: "edit", shift: shifts.find((s) => s.id === row.id) ?? row })}
        onDelete={onDelete}
      />
    </div>
  );
}
