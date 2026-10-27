import { onValue, push, ref, remove, set } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/firebase";
import { DEFAULT_SETTINGS } from "@/lib/tracker";
import TrackerView from "./TrackerView";

/**
 * The tracker on the signed-in user's data.
 * Data lives at /tracker/{uid}/shifts and /tracker/{uid}/settings in the Realtime Database.
 */
export default function CloudTracker({ uid }) {
  const [shifts, setShifts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const saveTimer = useRef(null);
  const base = `tracker/${uid}`;

  useEffect(() => {
    const offShifts = onValue(ref(db, `${base}/shifts`), (snap) => {
      const value = snap.val() ?? {};
      setShifts(Object.entries(value).map(([id, shift]) => ({ id, ...shift })));
    });
    const offSettings = onValue(ref(db, `${base}/settings`), (snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.val() });
    });
    return () => {
      offShifts();
      offSettings();
      clearTimeout(saveTimer.current);
    };
  }, [base]);

  // Settings change on every keystroke, so save them after a short pause.
  const updateSettings = (next) => {
    setSettings(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => set(ref(db, `${base}/settings`), next), 600);
  };

  return (
    <TrackerView
      shifts={shifts}
      settings={settings}
      onAdd={(shift) => push(ref(db, `${base}/shifts`), shift)}
      onUpdate={(id, shift) => set(ref(db, `${base}/shifts/${id}`), shift)}
      onDelete={(id) => remove(ref(db, `${base}/shifts/${id}`))}
      onSettings={updateSettings}
    />
  );
}
