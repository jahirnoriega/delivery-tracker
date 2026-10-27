import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/context";
import { toISODate } from "@/lib/format";
import { APPS, hoursBetween } from "@/lib/tracker";
import { Field } from "./ui";

const emptyShift = (base = {}) => ({
  date: toISODate(),
  app: "uber_eats",
  start: "19:00",
  end: "21:00",
  earnings: "",
  tips: "",
  km: "",
  trips: "",
  notes: "",
  // Ignore missing values so every input stays controlled.
  ...Object.fromEntries(Object.entries(base).filter(([, value]) => value !== undefined && value !== null)),
});

/** Turns the form's string values into the shape stored in the database. */
function toShift(draft) {
  return {
    date: draft.date,
    app: draft.app,
    start: draft.start,
    end: draft.end,
    hours: hoursBetween(draft.start, draft.end),
    earnings: Number(draft.earnings) || 0,
    tips: Number(draft.tips) || 0,
    km: Number(draft.km) || 0,
    trips: Number(draft.trips) || 0,
    notes: draft.notes?.trim() ?? "",
  };
}

/**
 * Add / edit form. `initial` pre-fills the fields (editing),
 * `onSubmit` receives the clean shift object.
 */
export default function ShiftForm({ initial, editing = false, onSubmit, onCancel }) {
  const { t } = useLocale();
  const [draft, setDraft] = useState(() => emptyShift(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  // Bring the form into view when it opens (useful when editing from the history at the bottom).
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));
  const hours = hoursBetween(draft.start, draft.end);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit(toShift(draft));
    } catch {
      setError(t.error);
      setBusy(false);
    }
  }

  const numberInput = (key, { step = "0.01", required = false } = {}) => (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      min="0"
      required={required}
      className="field"
      value={draft[key]}
      onChange={set(key)}
      placeholder="0"
    />
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:p-5 ${editing ? "ring-2 ring-brand/40" : ""}`}
    >
      <h2 className="col-span-2 font-semibold sm:col-span-4">{editing ? t.editShift : t.newShift}</h2>
      <Field label={t.date}>
        <input type="date" required className="field" value={draft.date} onChange={set("date")} />
      </Field>
      <Field label={t.app}>
        <select className="field" value={draft.app} onChange={set("app")}>
          {APPS.map((app) => (
            <option key={app.id} value={app.id}>
              {app.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.start}>
        <input type="time" required className="field" value={draft.start} onChange={set("start")} />
      </Field>
      <Field label={`${t.end} · ${hours} h`}>
        <input type="time" required className="field" value={draft.end} onChange={set("end")} />
      </Field>
      <Field label={`${t.earnings} (MXN)`}>{numberInput("earnings", { required: true })}</Field>
      <Field label={`${t.tips} (MXN)`}>{numberInput("tips")}</Field>
      <Field label={t.km}>{numberInput("km", { step: "0.1" })}</Field>
      <Field label={t.trips}>{numberInput("trips", { step: "1" })}</Field>
      <Field label={t.notes} className="col-span-2 sm:col-span-4">
        <input
          className="field"
          value={draft.notes}
          onChange={set("notes")}
          placeholder={t.notesPlaceholder}
        />
      </Field>
      <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-4">
        <button type="submit" className="btn btn-primary flex-1 sm:flex-none" disabled={busy}>
          {editing ? t.saveChanges : t.save}
        </button>
        <button type="button" className="btn btn-ghost flex-1 sm:flex-none" onClick={onCancel}>
          {t.cancel}
        </button>
        {error && <p className="w-full text-sm text-bad sm:w-auto">{error}</p>}
      </div>
    </form>
  );
}
