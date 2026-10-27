const intlLocale = (locale) => (locale === "es" ? "es-MX" : "en-US");

/** Parses "YYYY-MM-DD" as a local date (avoids the UTC off-by-one). */
export function parseISODate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** "Aug 18, 2024" / "18 ago 2024". */
export function formatDate(iso, locale) {
  return parseISODate(iso).toLocaleDateString(intlLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Whole pesos: "$5,348". */
export function formatMoney(value, locale) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/** Pesos with cents: "$118.85". */
export function formatMoneyPrecise(value, locale) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

/** Short chart label that fits narrow bars: "$596", "$1.9k". */
export function formatMoneyCompact(value) {
  const n = Math.round(value || 0);
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return abs >= 1000 ? `${sign}$${(abs / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${sign}$${abs}`;
}

/** Local date as "YYYY-MM-DD". */
export function toISODate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Mon, Oct 27" / "Lun 27 oct" — for tables and lists. */
export function formatDayDate(iso, locale) {
  const date = typeof iso === "string" ? parseISODate(iso) : iso;
  const weekday = date.toLocaleDateString(intlLocale(locale), { weekday: "short" }).replace(".", "");
  const day = date
    .toLocaleDateString(intlLocale(locale), { day: "numeric", month: "short" })
    .replace(".", "");
  return locale === "es" ? `${capitalize(weekday)} ${day}` : `${weekday}, ${day}`;
}

/** "Oct 27" / "27 oct" — short label for chart axes. */
export function formatShortDate(date, locale) {
  return date.toLocaleDateString(intlLocale(locale), { day: "numeric", month: "short" }).replace(".", "");
}

/** "+12%" / "−5%". */
export function formatPercent(value) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : rounded < 0 ? "−" : ""}${Math.abs(rounded)}%`;
}
