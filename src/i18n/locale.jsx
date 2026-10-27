import { useCallback, useEffect, useState } from "react";
import { LocaleContext } from "./context";
import { dictionaries } from "./dictionaries";

const STORAGE_KEY = "lang";

function initialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "es") return saved;
  } catch {
    // Storage unavailable: fall back to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((current) => {
      const next = current === "en" ? "es" : "en";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore: the choice still applies for this visit.
      }
      return next;
    });
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale, t: dictionaries[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}
