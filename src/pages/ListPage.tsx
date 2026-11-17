import { useLiveQuery } from 'dexie-react-hooks'
import { Wallet } from 'lucide-react'
import { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import MonthSwitcher from '../components/MonthSwitcher'
import { categoryById } from '../constants'
import { db } from '../db'
import type { Expense } from '../types'
import { formatDayLabel, formatMoney, monthKey } from '../utils/format'

type Props = {
  onGoAdd: () => void
}

export default function ListPage({ onGoAdd }: Props) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [editing, setEditing] = useState<Expense | null>(null)
  const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray(), [])

  const key = monthKey(month)
  const visible = (expenses ?? []).filter((expense) => expense.date.startsWith(key))
  const total = visible.reduce((sum, expense) => sum + expense.amount, 0)

  const groups = new Map<string, Expense[]>()
  for (const expense of visible) {
    const group = groups.get(expense.date)
    if (group) group.push(expense)
    else groups.set(expense.date, [expense])
  }

  return (
    <div className="flex flex-col gap-4">
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-200">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-200">Total spent</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{formatMoney(total)}</p>
        <p className="mt-1 text-xs text-indigo-200">
          {visible.length} {visible.length === 1 ? 'expense' : 'expenses'}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
            <Wallet size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">No expenses this month</p>
            <p className="mt-1 text-xs text-slate-500">Track your first one in a few seconds.</p>
          </div>
          <button
            onClick={onGoAdd}
            className="rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-200"
          >
            Add expense
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {[...groups.entries()].map(([date, items]) => (
            <section key={date}>
              <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {formatDayLabel(date)}
              </p>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                {items.map((expense) => {
                  const category = categoryById(expense.category)
                  return (
                    <button
                      key={expense.id ?? `${expense.date}-${expense.createdAt}`}
                      onClick={() => setEditing(expense)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: `${category.color}1f` }}
                      >
                        {category.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {category.label}
                        </span>
                        {expense.note && (
                          <span className="block truncate text-xs text-slate-400">
                            {expense.note}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                        {formatMoney(expense.amount)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-[2px]"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-slate-50 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
            <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Edit expense</h2>
            <ExpenseForm
              initial={editing}
              submitLabel="Save changes"
              showDelete
              onDone={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
