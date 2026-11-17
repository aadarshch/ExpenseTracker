import { useRef, useState, type FormEvent } from 'react'
import { CURRENCY_SYMBOL } from '../constants'
import { db } from '../db'
import type { LoanDirection } from '../types'
import { parseAmount, todayISO } from '../utils/format'
import DatePicker from './DatePicker'

type Props = {
  onDone: () => void
  people?: string[]
  initialPerson?: string
}

export default function LoanForm({ onDone, people = [], initialPerson = '' }: Props) {
  const [direction, setDirection] = useState<LoanDirection>('lent')
  const [person, setPerson] = useState(initialPerson)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO)
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
    if (!person.trim()) {
      setError('Enter a name')
      return
    }
    if (minorUnits === null) {
      setError('Enter a valid amount')
      return
    }
    if (!note.trim()) {
      setNoteError('Add a note — person entries need a reason too')
      noteRef.current?.focus()
      noteRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
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
            { id: 'lent', label: 'I lent', hint: 'They owe me · balance −' },
            { id: 'borrowed', label: 'I borrowed', hint: 'I owe them · balance +' },
          ] as const
        ).map((option) => {
          const active = direction === option.id
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => setDirection(option.id)}
              className={`px-3 py-2 text-left ${active ? 'chip chip-active' : 'chip'}`}
            >
              <span
                className={`block text-sm font-semibold ${
                  active ? 'text-[#f4dda6]' : 'text-white/70'
                }`}
              >
                {option.label}
              </span>
              <span className="block text-[11px] text-white/35">{option.hint}</span>
            </button>
          )
        })}
      </div>
      <p className="-mt-2 px-1 text-[10px] leading-snug text-white/30">
        {direction === 'lent'
          ? 'This amount is deducted from your balance right away.'
          : 'This amount is added to your balance right away.'}
      </p>

      <label className="field rounded-xl px-3 py-2">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/35">
          Person
        </span>
        <input
          type="text"
          value={person}
          onChange={(event) => {
            setPerson(event.target.value)
            setError('')
          }}
          list="loan-people"
          placeholder="Name"
          maxLength={40}
          className="mt-0.5 w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-white/25"
        />
        <datalist id="loan-people">
          {people.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-white/35">{CURRENCY_SYMBOL}</span>
          <input
            value={amount}
            onChange={(event) => handleAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0"
            autoComplete="off"
            className="w-full bg-transparent text-4xl font-semibold tracking-tight text-white outline-none placeholder:text-white/15"
          />
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
            placeholder="e.g. Split dinner bill"
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
        Required — add what the money was for; it helps when you settle up later.
      </p>

      {error && <p className="text-xs font-medium text-[#ff8a80]">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-gold w-full rounded-xl py-3.5 text-sm font-semibold disabled:opacity-60"
      >
        Save record
      </button>
    </form>
  )
}
