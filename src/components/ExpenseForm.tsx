import { useRef, useState, type FormEvent } from 'react'
import { CATEGORIES, CURRENCY_SYMBOL, type CategoryId } from '../constants'
import { db } from '../db'
import { parseAmount, todayISO } from '../utils/format'
import DatePicker from './DatePicker'

type Props = {
  submitLabel: string
  onDone: () => void
}

const NOTE_PLACEHOLDER: Record<CategoryId, string> = {
  food: 'e.g. Lunch with the team',
  transport: 'e.g. Auto to the office',
  bills: 'e.g. Electricity bill',
  shopping: 'e.g. New running shoes',
  health: 'e.g. Pharmacy — fever',
  fun: 'e.g. Movie tickets',
  education: 'e.g. Course fee',
  other: 'e.g. What was this for?',
}

export default function ExpenseForm({ submitLabel, onDone }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<CategoryId>('food')
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
      setNoteError('Add a note — every expense needs a reason')
      noteRef.current?.focus()
      noteRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }

    setSaving(true)
    const record = { amount: minorUnits, category, note: note.trim(), date }
    try {
      await db.expenses.add({ ...record, createdAt: Date.now() })
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="glass rounded-3xl p-4">
        <label
          htmlFor="amount"
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35"
        >
          Amount
        </label>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-white/35">{CURRENCY_SYMBOL}</span>
          <input
            id="amount"
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

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Category
        </p>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((categoryOption) => {
            const active = categoryOption.id === category
            return (
              <button
                type="button"
                key={categoryOption.id}
                onClick={() => setCategory(categoryOption.id)}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                  active ? 'chip chip-active' : 'chip'
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
            placeholder={NOTE_PLACEHOLDER[category]}
            maxLength={80}
            aria-invalid={noteError ? true : undefined}
            className="mt-0.5 w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-white/25"
          />
        </label>
      </div>
      {noteError && (
        <p className="-mt-2 px-1 text-[11px] font-medium text-[#ff8a80]">{noteError}</p>
      )}
      <p className="-mt-2 px-1 text-[10px] leading-snug text-white/30">
        Required — a short note keeps your accounting transparent and easy to review later.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="btn-gold mt-1 w-full rounded-xl py-3.5 text-sm font-semibold disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  )
}
