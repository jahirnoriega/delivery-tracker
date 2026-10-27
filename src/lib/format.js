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

/** Local date as "YYYY-MM-DD". */
export function toISODate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
