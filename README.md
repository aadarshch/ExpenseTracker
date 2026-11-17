# Expense Tracker

A private, offline-first expense tracker built as an installable PWA. Track spending on your iPhone — no accounts, no cloud.

## Features

- Add, edit and delete expenses with emoji categories
- Monthly history grouped by day, with totals
- Category breakdown donut chart and 6-month trend bars
- CSV export for backups
- Offline support and home-screen install (iOS Safari → Share → Add to Home Screen)
- Data stays on the device (IndexedDB via Dexie)

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Dexie · Recharts · vite-plugin-pwa

## Development

Requires Node 20+.

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

Currency defaults to INR. Change `CURRENCY` and `LOCALE` in `src/constants.ts`.

## Deploy

1. Push to GitHub
2. Import the repo at vercel.com — Vite is auto-detected (build `npm run build`, output `dist`)
3. Open the deployed URL in iPhone Safari → **Share → Add to Home Screen**

## Notes

Data is local to each device. Use **Export all expenses (CSV)** before clearing Safari data.
