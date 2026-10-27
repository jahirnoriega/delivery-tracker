import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { useLocale } from "@/i18n/context";
import { formatDayDate, formatMoney as money, formatMoneyPrecise as money2 } from "@/lib/format";
import { appInfo } from "@/lib/tracker";

/** Edit and delete buttons for one shift. */
function RowActions({ row, onEdit, onDelete, className = "" }) {
  const { t, locale } = useLocale();
  return (
    <div className={`flex justify-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => onEdit(row)}
        className="rounded-lg p-2 text-muted hover:bg-brand/10 hover:text-brand sm:p-1.5"
        aria-label={`${t.edit} ${formatDayDate(row.date, locale)}`}
        title={t.edit}
      >
        <HiOutlinePencilSquare />
      </button>
      <button
        type="button"
        onClick={() => window.confirm(t.confirmDelete) && onDelete(row.id)}
        className="rounded-lg p-2 text-muted hover:bg-bad/10 hover:text-bad sm:p-1.5"
        aria-label={`${t.delete} ${formatDayDate(row.date, locale)}`}
        title={t.delete}
      >
        <HiOutlineTrash />
      </button>
    </div>
  );
}

/** List of shifts for the selected period, with edit and delete actions. */
export default function HistoryTable({ rows, editingId, onEdit, onDelete }) {
  const { t, locale } = useLocale();

  return (
    <section className="card overflow-hidden">
      <h2 className="px-5 pt-5 font-semibold">{t.history}</h2>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-muted">{t.empty}</p>
      ) : (
        <>
          {/* Phones: one compact card per shift instead of a wide table. */}
          <ul className="mt-3 sm:hidden">
            {rows.map((row) => (
              <li
                key={row.id}
                className={`flex items-start gap-3 border-t border-line/60 px-4 py-3 ${
                  editingId === row.id ? "bg-brand/10" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-medium">{formatDayDate(row.date, locale)}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{money(row.net, locale)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-muted">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: appInfo(row.app).color }}
                      />
                      <span className="truncate">
                        {appInfo(row.app).label} · {row.start}–{row.end}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">{money2(row.perHour, locale)}/h</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted tabular-nums">
                    {row.hours.toFixed(1)} h · {t.gross} {money(row.gross, locale)} · {row.km} km
                    {row.notes ? ` · ${row.notes}` : ""}
                  </p>
                </div>
                <RowActions row={row} onEdit={onEdit} onDelete={onDelete} className="-mr-2 shrink-0" />
              </li>
            ))}
          </ul>

          <div className="mt-3 hidden overflow-x-auto sm:block">
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
                        <span
                          className="size-2 rounded-full"
                          style={{ background: appInfo(row.app).color }}
                        />
                        {appInfo(row.app).label}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">{row.hours.toFixed(1)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{money(row.gross, locale)}</td>
                    <td className="px-2 py-3 text-right tabular-nums">{row.km}</td>
                    <td className="px-2 py-3 text-right font-medium tabular-nums">
                      {money(row.net, locale)}
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">{money2(row.perHour, locale)}</td>
                    <td className="px-5 py-3">
                      <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
