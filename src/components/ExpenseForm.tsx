import { useState, type FormEvent } from 'react'
import { CATEGORIES, CURRENCY_SYMBOL, type CategoryId } from '../constants'
import { db } from '../db'
import type { Expense } from '../types'
import { parseAmount, todayISO } from '../utils/format'

type Props = {
  initial?: Expense
  submitLabel: string
  onDone: () => void
  showDelete?: boolean
}

export default function ExpenseForm({ initial, submitLabel, onDone, showDelete = false }: Props) {
  const [amount, setAmount] = useState(initial ? (initial.amount / 100).toFixed(2) : '')
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? 'food')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [note, setNote] = useState(initial?.note ?? '')
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
    const record = { amount: minorUnits, category, note: note.trim(), date }
    try {
      if (initial?.id !== undefined) {
        await db.expenses.update(initial.id, record)
      } else {
        await db.expenses.add({ ...record, createdAt: Date.now() })
      }
      onDone()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (initial?.id === undefined) return
    if (!window.confirm('Delete this expense?')) return
    await db.expenses.delete(initial.id)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <label
          htmlFor="amount"
          className="text-xs font-semibold uppercase tracking-wide text-slate-400"
        >
          Amount
        </label>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-400">{CURRENCY_SYMBOL}</span>
          <input
            id="amount"
            value={amount}
            onChange={(event) => handleAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0"
            autoComplete="off"
            className="w-full bg-transparent text-4xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-200"
          />
        </div>
        {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Category</p>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((categoryOption) => {
            const active = categoryOption.id === category
            return (
              <button
                type="button"
                key={categoryOption.id}
                onClick={() => setCategory(categoryOption.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[11px] font-medium transition ${
                  active
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <span className="text-lg leading-none">{categoryOption.emoji}</span>
                {categoryOption.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
          />
        </label>
        <label className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Note
          </span>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
            maxLength={80}
            className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-1 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition active:scale-[0.99] disabled:opacity-60"
      >
        {submitLabel}
      </button>

      {showDelete && (
        <button
          type="button"
          onClick={handleDelete}
          className="w-full rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-semibold text-red-500 transition active:scale-[0.99]"
        >
          Delete expense
        </button>
      )}
    </form>
  )
}
