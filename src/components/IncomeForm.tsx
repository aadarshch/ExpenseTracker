import { useState, type FormEvent } from 'react'
import { CURRENCY_SYMBOL } from '../constants'
import { db } from '../db'
import { parseAmount, todayISO } from '../utils/format'

type Props = {
  onDone: () => void
}

export default function IncomeForm({ onDone }: Props) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(todayISO)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAmount = (value: string) => {
    if (/^\d{0,9}(\.\d{0,2})?$/.test(value)) {
      setAmount(value)
      setError('')
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const minorUnits = parseAmount(amount)
    if (minorUnits === null) {
      setError('Enter a valid amount')
      return
    }
    setSaving(true)
    try {
      await db.incomes.add({
        amount: minorUnits,
        source: source.trim(),
        note: note.trim(),
        date,
        createdAt: Date.now(),
      })
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <label
          htmlFor="income-amount"
          className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
        >
          Amount received
        </label>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500">
            {CURRENCY_SYMBOL}
          </span>
          <input
            id="income-amount"
            value={amount}
            onChange={(event) => handleAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0"
            autoComplete="off"
            className="w-full bg-transparent text-4xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-200 dark:text-white dark:placeholder:text-slate-700"
          />
        </div>
        {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            From / source
          </span>
          <input
            type="text"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Salary, client, friend…"
            maxLength={60}
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-900 outline-none dark:text-slate-100"
            />
          </label>
          <label className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Note
            </span>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              maxLength={80}
              className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-1 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition active:scale-[0.99] disabled:opacity-60 dark:shadow-none"
      >
        Add money in
      </button>
    </form>
  )
}
