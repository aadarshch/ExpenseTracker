import { useRef, useState, type FormEvent } from 'react'
import { CURRENCY_SYMBOL } from '../constants'
import { db } from '../db'
import { parseAmount, todayISO } from '../utils/format'
import DatePicker from './DatePicker'

type Props = {
  onDone: () => void
}

export default function IncomeForm({ onDone }: Props) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(todayISO)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [noteError, setNoteError] = useState('')
  const [saving, setSaving] = useState(false)
  const noteRef = useRef<HTMLInputElement>(null)

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
    if (!note.trim()) {
      setNoteError('Add a note — every rupee needs a source')
      noteRef.current?.focus()
      noteRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
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
      <div className="glass rounded-3xl p-4">
        <label
          htmlFor="income-amount"
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35"
        >
          Amount received
        </label>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-white/35">{CURRENCY_SYMBOL}</span>
          <input
            id="income-amount"
            value={amount}
            onChange={(event) => handleAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0"
            autoComplete="off"
            className="w-full bg-transparent text-4xl font-semibold tracking-tight text-white outline-none placeholder:text-white/15"
          />
        </div>
        {error && <p className="mt-1 text-xs font-medium text-[#ff8a80]">{error}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="field rounded-xl px-3 py-2">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/35">
            From / source
          </span>
          <input
            type="text"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Salary, client, friend…"
            maxLength={60}
            className="mt-0.5 w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-white/25"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <DatePicker value={date} onChange={setDate} />
          <label className="field rounded-xl px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/35">
              Note <span className="text-[#ff8a80]">*</span>
            </span>
            <input
              ref={noteRef}
              type="text"
              value={note}
              onChange={(event) => {
                setNote(event.target.value)
                setNoteError('')
              }}
              placeholder="e.g. November salary"
              maxLength={80}
              aria-invalid={noteError ? true : undefined}
              className="mt-0.5 w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-white/25"
            />
          </label>
        </div>
      </div>
      {noteError && (
        <p className="-mt-2 px-1 text-[11px] font-medium text-[#ff8a80]">{noteError}</p>
      )}
      <p className="-mt-2 px-1 text-[10px] leading-snug text-white/30">
        Required — say where the money came from so every rupee can be traced.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="btn-green mt-1 w-full rounded-xl py-3.5 text-sm font-semibold disabled:opacity-60"
      >
        Add money in
      </button>
    </form>
  )
}
