/** Small shared building blocks for the tracker UI. */

/** KPI card. Cards in a row stretch to the same height and `children` (the change pill) sit at the bottom. */
export function Stat({ label, value, sub, accent, children }) {
  return (
    <div className="card flex min-w-0 flex-col p-4 sm:p-5">
      <p className="truncate text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold whitespace-nowrap tabular-nums sm:text-2xl ${accent ? "text-brand" : ""}`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      {children && <div className="mt-auto pt-2">{children}</div>}
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

/**
 * Green/red pill showing a percent change; nothing when there's no previous value.
 * `invert` is for costs, where going up is bad.
 */
export function Change({ value, label, invert = false }) {
  if (value === null || !Number.isFinite(value)) {
    return <p className="text-xs text-muted">{label}</p>;
  }
  const up = invert ? value <= 0 : value >= 0;
  const rounded = Math.round(value);
  // Phones only show the pill (a note above the cards says what it compares), so pills line up.
  return (
    <p className="text-xs" title={label}>
      <span
        className={`inline-flex rounded-full px-2 py-0.5 font-medium tabular-nums ${
          up ? "bg-good/15 text-good" : "bg-bad/15 text-bad"
        }`}
      >
        {rounded > 0 ? "+" : rounded < 0 ? "−" : ""}
        {Math.abs(rounded)}%
      </span>
      <span className="hidden text-muted sm:inline"> {label}</span>
    </p>
  );
}
