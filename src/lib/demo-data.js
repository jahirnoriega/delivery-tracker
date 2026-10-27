import { toISODate } from "./format";

// Made-up sample shifts (not real earnings), spread over the last three weeks.
// [days ago, app, start, end, earnings, tips, km, orders]
const SAMPLE = [
  [0, "uber_eats", "19:00", "21:00", 290, 75, 33, 6],
  [1, "uber_eats", "19:00", "21:30", 310, 85, 38, 7],
  [2, "amazon_flex", "16:00", "19:00", 540, 0, 62, 1],
  [3, "uber_eats", "18:30", "21:00", 265, 60, 34, 6],
  [5, "uber_eats", "12:00", "16:00", 420, 110, 55, 9],
  [6, "amazon_flex", "09:00", "13:00", 720, 0, 88, 1],
  [8, "uber_eats", "19:00", "22:00", 380, 95, 41, 8],
  [9, "amazon_flex", "16:30", "19:30", 540, 0, 70, 1],
  [10, "uber_eats", "19:00", "21:00", 230, 45, 29, 5],
  [12, "uber_eats", "13:00", "17:00", 455, 120, 58, 10],
  [13, "amazon_flex", "08:00", "12:00", 720, 0, 95, 1],
  [15, "uber_eats", "19:30", "21:30", 250, 70, 27, 6],
  [16, "amazon_flex", "17:00", "20:00", 540, 0, 66, 1],
  [19, "uber_eats", "12:30", "16:30", 470, 105, 60, 9],
  [20, "amazon_flex", "09:00", "13:00", 720, 0, 101, 1],
];

export function buildDemoShifts() {
  return SAMPLE.map(([daysAgo, app, start, end, earnings, tips, km, trips], i) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return { id: `demo-${i}`, date: toISODate(date), app, start, end, earnings, tips, km, trips, notes: "" };
  });
}
