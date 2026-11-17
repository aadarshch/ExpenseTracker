# Expense Tracker

A private, offline-first expense tracker built as an installable PWA. Track spending, income and money lent or borrowed on your iPhone — no accounts, no cloud.

## Features

- Add, edit and delete expenses with emoji categories
- **Money in** records (salary, refunds, gifts) that update your balance
- **Current balance** card — tap Edit to match your real bank balance in one step
- **People** ledger: track money you lent or borrowed, settle it, and see totals to receive / pay
- Monthly history grouped by day, with totals
- Category breakdown donut chart and 6-month trend bars
- **Dark mode** that follows the phone setting
- **CSV import/export** and full **JSON backup / restore**
- Offline support and home-screen install (iOS Safari → Share → Add to Home Screen)
- Data stays on the device (IndexedDB via Dexie)

## How the balance works

Balance = money in − expenses ± open people records + manual adjustments.

Lending lowers the balance, borrowing raises it, and settling a record reverses its effect. Tapping **Edit** on the balance card stores a one-time adjustment so the app matches your real bank balance exactly.

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

### Run from VS Code

This repo ships with a portable Node build in `.tools/` (not committed). Open the folder in VS Code and use **Terminal → Run Task…**:

- **Expense Tracker: dev server** — starts Vite with a LAN URL you can open on your iPhone (same Wi-Fi)
- **Expense Tracker: production build** — type-checks and builds to `dist/`

## Deploy

1. Push to GitHub
2. Import the repo at vercel.com — Vite is auto-detected (build `npm run build`, output `dist`)
3. Open the deployed URL in iPhone Safari → **Share → Add to Home Screen**

## Data safety

Data is local to each device. Use **Backup all** (JSON) for full backups and **Export CSV** for a spreadsheet copy before clearing Safari data. **Restore backup** replaces everything on the device with the file you choose.
