import { createContext, useContext } from "react";

export const LocaleContext = createContext(null);

/** Returns `{ locale, toggleLocale, t }`. */
export const useLocale = () => useContext(LocaleContext);
