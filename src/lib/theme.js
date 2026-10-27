import { useCallback, useSyncExternalStore } from "react";

// The `.dark` class on <html> (set before paint in index.html) is the source of truth.
function subscribe(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getSnapshot = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  const toggleTheme = useCallback(() => {
    const next = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Ignore: the toggle still works for this visit.
    }
  }, []);

  return { theme, toggleTheme };
}
