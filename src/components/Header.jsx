import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import { useLocale } from "@/i18n/context";
import { useTheme } from "@/lib/theme";

const iconButton =
  "glass grid size-11 place-items-center rounded-full text-sm font-semibold transition hover:scale-105";

/** Top bar: app icon on the left, language/theme and the session action on the right. */
export default function Header({ action }) {
  const { t, toggleLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="container-wide flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-full glass">
          <img src="/favicon.svg" alt="" className="size-6 rounded-md" />
        </span>
        <div className="flex items-center gap-2">
          {action}
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t.header.switchLang}
            title={t.header.switchLang}
            className={iconButton}
          >
            {t.header.langLabel}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t.header.theme}
            title={t.header.theme}
            className={`${iconButton} text-brand`}
          >
            {theme === "dark" ? <HiOutlineSun className="size-5" /> : <HiOutlineMoon className="size-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
