import { FcGoogle } from "react-icons/fc";
import { HiOutlineLockClosed, HiOutlinePlay } from "react-icons/hi2";
import { useLocale } from "@/i18n/context";

/** Start screen: sign in for real data, or open the demo. */
export default function Landing({ onSignIn, onDemo, notice, busy }) {
  const { t } = useLocale();

  return (
    <main className="container-wide flex flex-col items-center pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center sm:pt-28">
      <img src="/favicon.svg" alt="" className="size-16 rounded-2xl shadow-lg" />
      <h1 className="mt-8 text-4xl font-bold tracking-tight text-balance sm:text-5xl">{t.appName}</h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">{t.tagline}</p>

      <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
        <button type="button" onClick={onSignIn} disabled={busy} className="btn btn-ghost w-full py-3">
          <FcGoogle className="size-5" /> {t.landing.signIn}
        </button>
        <button type="button" onClick={onDemo} className="btn btn-primary w-full py-3">
          <HiOutlinePlay className="size-5" /> {t.landing.tryDemo}
        </button>
      </div>

      {notice && <p className="mt-4 max-w-sm text-sm text-bad">{notice}</p>}

      <ul className="mt-10 flex max-w-sm flex-col gap-2 text-sm text-muted">
        <li className="flex items-start gap-2 text-left">
          <HiOutlineLockClosed className="mt-0.5 size-4 shrink-0" /> {t.landing.privateNote}
        </li>
        <li className="flex items-start gap-2 text-left">
          <HiOutlinePlay className="mt-0.5 size-4 shrink-0" /> {t.landing.demoNote}
        </li>
      </ul>

      <p className="mt-16 text-xs text-muted">
        {t.landing.by}{" "}
        <a
          href="https://jahirnoriega.netlify.app"
          className="inline-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jahir Noriega
        </a>
      </p>
    </main>
  );
}
