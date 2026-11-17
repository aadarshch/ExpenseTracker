import { Plus, Users } from 'lucide-react'
import { useState } from 'react'
import LoanForm from '../components/LoanForm'
import Sheet from '../components/Sheet'
import { db } from '../db'
import { useLedger } from '../hooks/useLedger'
import type { Loan } from '../types'
import { formatDayLabel, formatMoney } from '../utils/format'

export default function PeoplePage() {
  const { loans } = useLedger()
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState<Loan | null>(null)
  const [showSettled, setShowSettled] = useState(false)

  const open = loans.filter((loan) => !loan.settled)
  const settled = loans.filter((loan) => loan.settled)
  const toReceive = open
    .filter((loan) => loan.direction === 'lent')
    .reduce((sum, loan) => sum + loan.amount, 0)
  const toPay = open
    .filter((loan) => loan.direction === 'borrowed')
    .reduce((sum, loan) => sum + loan.amount, 0)

  const settle = async (loan: Loan) => {
    if (loan.id === undefined) return
    await db.loans.update(loan.id, { settled: true, settledAt: Date.now() })
    setSelected(null)
  }

  const remove = async (loan: Loan) => {
    if (loan.id === undefined) return
    if (!window.confirm('Delete this record? Your balance will be recalculated.')) return
    await db.loans.delete(loan.id)
    setSelected(null)
  }

  const renderRow = (loan: Loan, dimmed = false) => (
    <button
      key={loan.id ?? `${loan.person}-${loan.createdAt}`}
      onClick={() => setSelected(loan)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50 dark:active:bg-slate-800 ${
        dimmed ? 'opacity-60' : ''
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
        {loan.person.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {loan.person}
        </span>
        <span className="block text-xs text-slate-400 dark:text-slate-500">
          {loan.settled
            ? 'Settled'
            : loan.direction === 'lent'
              ? 'Owes you'
              : 'You owe'}{' '}
          · {formatDayLabel(loan.date)}
        </span>
      </span>
      <span
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          loan.direction === 'lent'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-500 dark:text-red-400'
        }`}
      >
        {loan.direction === 'lent' ? '+' : '−'}
        {formatMoney(loan.amount)}
      </span>
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">People</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Money lent and borrowed
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition active:scale-95 dark:shadow-none"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            To receive
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatMoney(toReceive)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            To pay
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-red-500 dark:text-red-400">
            {formatMoney(toPay)}
          </p>
        </div>
      </div>

      {open.length === 0 && settled.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-400 dark:bg-indigo-950 dark:text-indigo-400">
            <Users size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No people yet</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Record money you lent or borrowed to keep track.
            </p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            Add record
          </button>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
              {open.map((loan) => renderRow(loan))}
            </div>
          )}

          {settled.length > 0 && (
            <div>
              <button
                onClick={() => setShowSettled((value) => !value)}
                className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                {showSettled ? 'Hide' : 'Show'} settled ({settled.length})
              </button>
              {showSettled && (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
                  {settled.map((loan) => renderRow(loan, true))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {adding && (
        <Sheet onClose={() => setAdding(false)}>
          <h2 className="mb-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Add record
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            Lending lowers your balance, borrowing raises it — settling reverses it.
          </p>
          <LoanForm onDone={() => setAdding(false)} />
        </Sheet>
      )}

      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              {selected.person.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {selected.person}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selected.settled
                  ? 'Settled'
                  : selected.direction === 'lent'
                    ? 'Owes you'
                    : 'You owe'}{' '}
                · {formatDayLabel(selected.date)}
              </p>
            </div>
          </div>

          <p
            className={`mt-4 text-3xl font-bold tracking-tight ${
              selected.direction === 'lent'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            }`}
          >
            {selected.direction === 'lent' ? '+' : '−'}
            {formatMoney(selected.amount)}
          </p>
          {selected.note && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selected.note}</p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            {!selected.settled && (
              <button
                onClick={() => void settle(selected)}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
              >
                Mark as settled
              </button>
            )}
            <button
              onClick={() => void remove(selected)}
              className="w-full rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-semibold text-red-500 transition active:scale-[0.99] dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
            >
              Delete record
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}
