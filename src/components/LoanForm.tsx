import { useState, type FormEvent } from 'react'
import { CURRENCY_SYMBOL } from '../constants'
import { db } from '../db'
import type { LoanDirection } from '../types'
import { parseAmount, todayISO } from '../utils/format'

type Props = {
  onDone: () => void
}

export default function LoanForm({ onDone }: Props) {
  const [direction, setDirection] = useState<LoanDirection>('lent')
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO)
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
    if (!person.trim()) {
      setError('Enter a name')
      return
    }
    if (minorUnits === null) {
      setError('Enter a valid amount')
      return
    }
    setSaving(true)
    try {
      await db.loans.add({
        person: person.trim(),
        direction,
        amount: minorUnits,
        note: note.trim(),
        date,
        settled: false,
        createdAt: Date.now(),
      })
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { id: 'lent', label: 'I lent', hint: 'They owe me' },
            { id: 'borrowed', label: 'I borrowed', hint: 'I owe them' },
          ] as const
        ).map((option) => {
          const active = direction === option.id
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => setDirection(option.id)}
              className={`rounded-xl border px-3 py-2 text-left transition ${
                active
                  ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <span
                className={`block text-sm font-semibold ${
                  active
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {option.label}
              </span>
              <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                {option.hint}
              </span>
            </button>
          )
        })}
      </div>

      <label className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Person
        </span>
        <input
          type="text"
          value={person}
          onChange={(event) => {
            setPerson(event.target.value)
            setError('')
          }}
          placeholder="Name"
          maxLength={40}
          className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600"
        />
      </label>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500">
            {CURRENCY_SYMBOL}
          </span>
          <input
            value={amount}
            onChange={(event) => handleAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0"
            autoComplete="off"
            className="w-full bg-transparent text-4xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-200 dark:text-white dark:placeholder:text-slate-700"
          />
        </div>
      </div>

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

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition active:scale-[0.99] disabled:opacity-60 dark:shadow-none"
      >
        Save record
      </button>
    </form>
  )
}
