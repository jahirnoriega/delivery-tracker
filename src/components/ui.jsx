/** Small shared building blocks for the tracker UI. */

export function Stat({ label, value, sub, accent, children }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${accent ? "text-brand" : ""}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      {children}
    </div>
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

/** Green/red pill showing a percent change; nothing when there's no previous value. */
export function Change({ value, label }) {
  if (value === null || !Number.isFinite(value)) {
    return <p className="mt-2 text-xs text-muted">{label}</p>;
  }
  const up = value >= 0;
  const rounded = Math.round(value);
  return (
    <p className="mt-2 text-xs">
      <span
        className={`inline-flex rounded-full px-2 py-0.5 font-medium tabular-nums ${
          up ? "bg-good/15 text-good" : "bg-bad/15 text-bad"
        }`}
      >
        {rounded > 0 ? "+" : rounded < 0 ? "−" : ""}
        {Math.abs(rounded)}%
      </span>{" "}
      <span className="text-muted">{label}</span>
    </p>
  );
}
