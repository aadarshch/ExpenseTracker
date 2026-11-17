import {
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import MonthSwitcher from '../components/MonthSwitcher'
import { categoryById } from '../constants'
import { useLedger } from '../hooks/useLedger'
import { formatDayLabel, formatMoney, monthKey } from '../utils/format'

type EntryKind = 'expense' | 'income' | 'lent' | 'borrowed' | 'received' | 'paid' | 'adjustment'

type Entry = {
  key: string
  kind: EntryKind
  date: string
  createdAt: number
  title: string
  detail: string
  amount: number
  icon: ReactNode
}

const signedMoney = (amount: number) =>
  `${amount > 0 ? '+' : '−'}${formatMoney(Math.abs(amount))}`

export default function ListPage({ onGoAdd }: { onGoAdd: () => void }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const { expenses, incomes, loans, settlements, adjustments } = useLedger()

  const key = monthKey(month)
  const inMonth = (date: string) => date.startsWith(key)

  const entries: Entry[] = []

  for (const expense of expenses) {
    if (!inMonth(expense.date)) continue
    const category = categoryById(expense.category)
    entries.push({
      key: `expense-${expense.id ?? expense.createdAt}`,
      kind: 'expense',
      date: expense.date,
      createdAt: expense.createdAt,
      title: category.label,
      detail: expense.note,
      amount: -expense.amount,
      icon: (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-base"
          style={{ backgroundColor: `${category.color}22` }}
        >
          {category.emoji}
        </span>
      ),
    })
  }

  for (const income of incomes) {
    if (!inMonth(income.date)) continue
    entries.push({
      key: `income-${income.id ?? income.createdAt}`,
      kind: 'income',
      date: income.date,
      createdAt: income.createdAt,
      title: income.source || 'Money in',
      detail: income.note,
      amount: income.amount,
      icon: (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#30d158]/10 text-[#4ade80]">
          <ArrowDownLeft size={16} />
        </span>
      ),
    })
  }

  for (const loan of loans) {
    if (!inMonth(loan.date)) continue
    const lent = loan.direction === 'lent'
    entries.push({
      key: `loan-${loan.id ?? loan.createdAt}`,
      kind: lent ? 'lent' : 'borrowed',
      date: loan.date,
      createdAt: loan.createdAt,
      title: lent ? `Lent to ${loan.person}` : `Borrowed from ${loan.person}`,
      detail: loan.note,
      amount: lent ? -loan.amount : loan.amount,
      icon: (
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            lent ? 'bg-[#ff453a]/10 text-[#ff8a80]' : 'bg-[#30d158]/10 text-[#4ade80]'
          }`}
        >
          {lent ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
        </span>
      ),
    })
  }

  for (const settlement of settlements) {
    if (!inMonth(settlement.date)) continue
    const received = settlement.direction === 'received'
    entries.push({
      key: `settlement-${settlement.id ?? settlement.createdAt}`,
      kind: received ? 'received' : 'paid',
      date: settlement.date,
      createdAt: settlement.createdAt,
      title: received
        ? `Received from ${settlement.person}`
        : `Paid ${settlement.person}`,
      detail: settlement.note,
      amount: received ? settlement.amount : -settlement.amount,
      icon: (
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            received ? 'bg-[#30d158]/10 text-[#4ade80]' : 'bg-[#ff453a]/10 text-[#ff8a80]'
          }`}
        >
          {received ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
        </span>
      ),
    })
  }

  for (const adjustment of adjustments) {
    if (!inMonth(adjustment.date) || adjustment.amount === 0) continue
    entries.push({
      key: `adjustment-${adjustment.id ?? adjustment.createdAt}`,
      kind: 'adjustment',
      date: adjustment.date,
      createdAt: adjustment.createdAt,
      title: 'Balance update',
      detail: adjustment.note,
      amount: adjustment.amount,
      icon: (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8c27a]/10 text-[#f0d29a]">
          <SlidersHorizontal size={15} />
        </span>
      ),
    })
  }

  const grouped = new Map<string, Entry[]>()
  for (const entry of entries) {
    const group = grouped.get(entry.date)
    if (group) group.push(entry)
    else grouped.set(entry.date, [entry])
  }
  const days = [...grouped.entries()].sort(([a], [b]) => (a < b ? 1 : -1))
  for (const [, items] of days) {
    items.sort((a, b) => b.createdAt - a.createdAt)
  }

  const moneyOut = entries
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum - entry.amount, 0)
  const moneyIn = entries
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Money out
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-[#ff8a80]">
            {formatMoney(moneyOut)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Money in
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-[#4ade80]">
            {formatMoney(moneyIn)}
          </p>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="glass-dashed flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#e8c27a]/70">
            <Wallet size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">No transactions this month</p>
            <p className="mt-1 text-xs text-white/40">
              Expenses, money in, loans and settlements all appear here.
            </p>
          </div>
          <button
            onClick={onGoAdd}
            className="btn-gold rounded-full px-5 py-2 text-xs font-semibold"
          >
            Add transaction
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {days.map(([date, items]) => (
            <section key={date}>
              <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                {formatDayLabel(date)}
              </p>
              <div className="glass-soft divide-hairline overflow-hidden rounded-2xl">
                {items.map((entry) => (
                  <div key={entry.key} className="flex items-center gap-3 px-4 py-3">
                    <span className="shrink-0">{entry.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-white/90">
                        {entry.title}
                      </span>
                      <span className="block truncate text-xs text-white/35">
                        {entry.detail}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${
                        entry.amount > 0
                          ? 'text-[#4ade80]'
                          : entry.kind === 'adjustment'
                            ? 'text-white/70'
                            : 'text-white/85'
                      }`}
                    >
                      {signedMoney(entry.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="px-1 pb-1 text-center text-[10px] leading-relaxed text-white/25">
        History is read-only. Expenses, money in, loans and settlements can’t be edited once
        saved — clearing all data in Stats erases everything.
      </p>
    </div>
  )
}
