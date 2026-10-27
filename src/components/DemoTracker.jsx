import { useState } from "react";
import { buildDemoShifts } from "@/lib/demo-data";
import { DEFAULT_SETTINGS } from "@/lib/tracker";
import TrackerView from "./TrackerView";

/** The tracker on sample data. Nothing is saved; a reload starts over. */
export default function DemoTracker() {
  const [shifts, setShifts] = useState(buildDemoShifts);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  return (
    <TrackerView
      demo
      shifts={shifts}
      settings={settings}
      onAdd={async (shift) => setShifts((prev) => [...prev, { ...shift, id: crypto.randomUUID() }])}
      onDelete={(id) => setShifts((prev) => prev.filter((s) => s.id !== id))}
      onSettings={setSettings}
    />
  );
}
