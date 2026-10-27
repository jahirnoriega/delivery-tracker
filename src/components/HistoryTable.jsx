import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { useLocale } from "@/i18n/context";
import { formatDayDate, formatMoney as money, formatMoneyPrecise as money2 } from "@/lib/format";
import { appInfo } from "@/lib/tracker";

/** List of shifts for the selected period, with edit and delete actions. */
export default function HistoryTable({ rows, editingId, onEdit, onDelete }) {
  const { t, locale } = useLocale();

  return (
    <section className="card overflow-hidden">
      <h2 className="px-5 pt-5 font-semibold">{t.history}</h2>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted">{t.empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-2 font-medium">{t.date}</th>
                <th className="px-2 py-2 font-medium">{t.app}</th>
                <th className="px-2 py-2 text-right font-medium">{t.hours}</th>
                <th className="px-2 py-2 text-right font-medium">{t.gross}</th>
                <th className="px-2 py-2 text-right font-medium">km</th>
                <th className="px-2 py-2 text-right font-medium">{t.net}</th>
                <th className="px-2 py-2 text-right font-medium">{t.perHour}</th>
                <th className="px-5 py-2">
                  <span className="sr-only">{t.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-line/60 last:border-0 ${
                    editingId === row.id ? "bg-brand/10" : "hover:bg-surface-2/50"
                  }`}
                >
                  <td className="px-5 py-3">
                    <span className="font-medium">{formatDayDate(row.date, locale)}</span>
                    <span className="block text-xs text-muted">
                      {row.start}–{row.end}
                      {row.notes ? ` · ${row.notes}` : ""}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: appInfo(row.app).color }} />
                      {appInfo(row.app).label}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums">{row.hours.toFixed(1)}</td>
                  <td className="px-2 py-3 text-right tabular-nums">{money(row.gross, locale)}</td>
                  <td className="px-2 py-3 text-right tabular-nums">{row.km}</td>
                  <td className="px-2 py-3 text-right font-medium tabular-nums">{money(row.net, locale)}</td>
                  <td className="px-2 py-3 text-right tabular-nums">{money2(row.perHour, locale)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="rounded-lg p-1.5 text-muted hover:bg-brand/10 hover:text-brand"
                        aria-label={`${t.edit} ${formatDayDate(row.date, locale)}`}
                        title={t.edit}
                      >
                        <HiOutlinePencilSquare />
                      </button>
                      <button
                        type="button"
                        onClick={() => window.confirm(t.confirmDelete) && onDelete(row.id)}
                        className="rounded-lg p-1.5 text-muted hover:bg-bad/10 hover:text-bad"
                        aria-label={`${t.delete} ${formatDayDate(row.date, locale)}`}
                        title={t.delete}
                      >
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
