import { Pencil } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { CURRENCY_SYMBOL } from '../constants'
import { db } from '../db'
import { formatMoney, parseBalanceTarget, todayISO } from '../utils/format'
import Sheet from './Sheet'

type Props = {
  balance: number
}

export default function BalanceCard({ balance }: Props) {
  const [editing, setEditing] = useState(false)
  const [target, setTarget] = useState('')
  const [error, setError] = useState('')

  const openEditor = () => {
    setTarget((balance / 100).toFixed(2))
    setError('')
    setEditing(true)
  }

  const handleTarget = (value: string) => {
    if (/^-?\d{0,9}(\.\d{0,2})?$/.test(value)) {
      setTarget(value)
      setError('')
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const minorUnits = parseBalanceTarget(target)
    if (minorUnits === null) {
      setError('Enter a valid amount')
      return
    }
    const delta = minorUnits - balance
    if (delta !== 0) {
      await db.adjustments.add({
        amount: delta,
        note: 'Balance update',
        date: todayISO(),
        createdAt: Date.now(),
      })
    }
    setEditing(false)
  }

  return (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Current balance
            </p>
            <p
              className={`mt-1 text-3xl font-bold tracking-tight ${
                balance < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatMoney(balance)}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Money in − expenses + people
            </p>
          </div>
          <button
            onClick={openEditor}
            className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition active:scale-95 dark:bg-slate-800 dark:text-slate-300"
          >
            <Pencil size={12} />
            Edit
          </button>
        </div>
      </div>

      {editing && (
        <Sheet onClose={() => setEditing(false)}>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Set current balance
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enter the real balance from your bank or wallet — the app records a one-time adjustment.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500">
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  autoFocus
                  value={target}
                  onChange={(event) => handleTarget(event.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  autoComplete="off"
                  className="w-full bg-transparent text-4xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-200 dark:text-white dark:placeholder:text-slate-700"
                />
              </div>
              {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition active:scale-[0.99] dark:shadow-none"
            >
              Update balance
            </button>
          </form>
        </Sheet>
      )}
    </>
  )
}
