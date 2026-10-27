# Delivery Tracker

A small app to log delivery shifts (Uber Eats, Amazon Flex, DiDi Food…) and compare them by what you **actually keep after gas**: per hour, per km and per app.

**Live:** [delivery-tracker-jn.netlify.app](https://delivery-tracker-jn.netlify.app). Use **Try the demo** to explore it with sample data.

## Features

- **Log a shift:** date, app, start and end time, earnings, tips, kilometers, orders and notes.
- **See what's left after gas.** Gas cost is calculated from your car's km per liter and the gas price, and both values are editable.
- **Compare:** net per hour by app, net per hour by weekday, and a "who pays more" summary.
- **Earnings dashboard:** net this week and this month compared with the same days of the previous period, net per week for the last 8 weeks, the last 14 days, your best day, and a breakdown from gross to net.
- **Edit or delete any shift** if you logged something wrong.
- **Filter and export.** View all time or the last 30 or 7 days, and export to CSV.
- **Private by design.** You sign in with Google, and the Firebase rules only let the owner's account read or write data.
- **Demo mode.** It's the same UI running on sample data that never leaves the browser.
- **English and Spanish**, plus light and dark themes. You can install it on your phone's home screen.

## Tech stack

Vite, React 19, Tailwind CSS 4, Firebase (Authentication + Realtime Database), deployed on Netlify.

## Getting started

Requirements: Node.js 20.19 or newer.

```bash
npm install
cp .env.example .env.local   # fill in your Firebase web app config
npm run dev
```

| Command           | What it does               |
| ----------------- | -------------------------- |
| `npm run dev`     | Start the dev server       |
| `npm run build`   | Build to `dist/`           |
| `npm run preview` | Serve the production build |
| `npm run lint`    | Run ESLint                 |
| `npm run format`  | Format with Prettier       |

## Firebase setup

1. Create a Firebase project and add a **web app**. Copy its config into `.env.local`.
2. In **Authentication → Sign-in method**, enable **Google**. Under **Settings → Authorized domains**, add your Netlify domain.
3. Create a **Realtime Database**. In its **Rules** tab, publish [`database.rules.json`](./database.rules.json) with your own email.
4. Set `VITE_OWNER_EMAIL` to that same email.

Data is stored per user at `tracker/{uid}/shifts` and `tracker/{uid}/settings`.

## Project structure

```
src/
├── App.jsx              # Landing ↔ demo ↔ signed-in tracker
├── components/
│   ├── TrackerView.jsx  # Tracker layout: tabs, filters, form and history
│   ├── OverviewTab.jsx  # KPIs and comparisons by app / weekday
│   ├── EarningsTab.jsx  # Earnings dashboard
│   ├── ShiftForm.jsx    # Add / edit a shift
│   ├── HistoryTable.jsx # Shift list with edit and delete
│   ├── CloudTracker.jsx # TrackerView + Firebase
│   ├── DemoTracker.jsx  # TrackerView + sample data
│   ├── Header.jsx
│   └── Landing.jsx
├── i18n/                # en / es dictionaries and locale context
└── lib/
    ├── tracker.js       # Pure math: gas, net, per hour, per km, summaries, CSV
    ├── format.js        # Dates and currency
    ├── firebase.js      # Firebase client
    ├── demo-data.js     # Sample shifts
    └── theme.js         # Light / dark theme
```

## License

[MIT](./LICENSE) © Jahir Noriega
