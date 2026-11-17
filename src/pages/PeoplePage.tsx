import { ArrowDownLeft, ArrowUpRight, ChevronRight, Plus, Users } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import DatePicker from '../components/DatePicker'
import LoanForm from '../components/LoanForm'
import Sheet from '../components/Sheet'
import { db } from '../db'
import { useLedger } from '../hooks/useLedger'
import type { Loan, Settlement, SettlementDirection } from '../types'
import { formatDayLabel, formatMoney, parseAmount, todayISO } from '../utils/format'

type PersonLedger = {
  key: string
  name: string
  net: number
  loans: Loan[]
  settlements: Settlement[]
}

async function settleInFull(person: PersonLedger) {
  if (person.net === 0) return
  await db.settlements.add({
    person: person.name,
    direction: person.net > 0 ? 'received' : 'paid',
    amount: Math.abs(person.net),
    note: 'Full settlement',
    date: todayISO(),
    createdAt: Date.now(),
  })
}

const personKey = (name: string) => name.trim().toLowerCase()

const statusText = (net: number) =>
  net > 0 ? 'Owes you' : net < 0 ? 'You owe' : 'All settled'

function SettlementForm({ person }: { person: PersonLedger }) {
  const [direction, setDirection] = useState<SettlementDirection>(
    person.net < 0 ? 'paid' : 'received',
  )
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
    if (minorUnits === null) {
      setError('Enter a valid amount')
      return
    }
    if (!note.trim()) {
      setNoteError('Add a note — settlements need a reason too')
      noteRef.current?.focus()
      noteRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    setSaving(true)
    try {
      await db.settlements.add({
        person: person.name,
        direction,
        amount: minorUnits,
        note: note.trim(),
        date,
        createdAt: Date.now(),
      })
      setAmount('')
      setNote('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass mt-3 rounded-2xl p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
        Add a settlement
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {(
          [
            { id: 'received', label: 'Received', hint: 'They paid me · balance +' },
            { id: 'paid', label: 'Paid', hint: 'I paid them · balance −' },
          ] as const
        ).map((option) => {
          const active = direction === option.id
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => setDirection(option.id)}
              className={`rounded-xl px-3 py-2 text-left ${
                active ? 'chip chip-active' : 'chip'
              }`}
            >
              <span
                className={`block text-sm font-semibold ${
                  active ? 'text-[#f4dda6]' : 'text-white/70'
                }`}
              >
                {option.label}
              </span>
              <span className="block text-[10px] text-white/35">{option.hint}</span>
            </button>
          )
        })}
      </div>

      <div className="field mt-2 flex items-baseline gap-1 rounded-xl px-3 py-2">
        <span className="text-lg font-semibold text-white/35">₹</span>
        <input
          value={amount}
          onChange={(event) => handleAmount(event.target.value)}
          inputMode="decimal"
          placeholder="0"
          autoComplete="off"
          aria-label="Settlement amount"
          className="w-full bg-transparent text-xl font-semibold tracking-tight text-white outline-none placeholder:text-white/15"
        />
      </div>
      {error && <p className="mt-1 text-[11px] font-medium text-[#ff8a80]">{error}</p>}
      <p className="mt-1 px-1 text-[10px] leading-snug text-white/30">
        {direction === 'received'
          ? 'Money they return is added back to your balance.'
          : 'Money you pay is deducted from your balance.'}
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2">
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
            placeholder="e.g. Returned half"
            maxLength={80}
            aria-invalid={noteError ? true : undefined}
            className="mt-0.5 w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-white/25"
          />
        </label>
      </div>
      {noteError && (
        <p className="mt-1 px-1 text-[11px] font-medium text-[#ff8a80]">{noteError}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-gold mt-3 w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        Save settlement
      </button>
    </form>
  )
}

export default function PeoplePage() {
  const { loans, settlements } = useLedger()
  const [adding, setAdding] = useState(false)
  const [initialPerson, setInitialPerson] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const peopleMap = new Map<string, PersonLedger>()
  const ensure = (name: string) => {
    const key = personKey(name)
    let ledger = peopleMap.get(key)
    if (!ledger) {
      ledger = { key, name: name.trim(), net: 0, loans: [], settlements: [] }
      peopleMap.set(key, ledger)
    }
    return ledger
  }

  for (const loan of loans) {
    const ledger = ensure(loan.person)
    ledger.loans.push(loan)
    if (!loan.settled) {
      ledger.net += loan.direction === 'lent' ? loan.amount : -loan.amount
    }
  }
  for (const settlement of settlements) {
    const ledger = ensure(settlement.person)
    ledger.settlements.push(settlement)
    ledger.net += settlement.direction === 'received' ? -settlement.amount : settlement.amount
  }

  const people = [...peopleMap.values()].sort(
    (a, b) => Math.abs(b.net) - Math.abs(a.net) || a.name.localeCompare(b.name),
  )
  const toReceive = people.reduce((sum, person) => sum + Math.max(person.net, 0), 0)
  const toPay = people.reduce((sum, person) => sum + Math.max(-person.net, 0), 0)
  const selected = selectedKey ? (peopleMap.get(selectedKey) ?? null) : null

  const startLoanFor = (name: string) => {
    setInitialPerson(name)
    setSelectedKey(null)
    setAdding(true)
  }

  const openAdd = () => {
    setInitialPerson('')
    setAdding(true)
  }

  const activity = selected
    ? [
        ...selected.loans.map((loan) => ({
          kind: 'loan' as const,
          at: loan.createdAt,
          loan,
        })),
        ...selected.settlements.map((settlement) => ({
          kind: 'settlement' as const,
          at: settlement.createdAt,
          settlement,
        })),
      ].sort((a, b) => b.at - a.at)
    : []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">People</h1>
          <p className="mt-0.5 text-sm text-white/45">Lend, borrow and settle up</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-gold flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            To receive
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-[#4ade80]">
            {formatMoney(toReceive)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            To pay
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-[#ff8a80]">
            {formatMoney(toPay)}
          </p>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="glass-dashed flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#e8c27a]/70">
            <Users size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">No people yet</p>
            <p className="mt-1 text-xs text-white/40">
              Record money you lent or borrowed to keep track.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="btn-gold rounded-full px-5 py-2 text-xs font-semibold"
          >
            Add record
          </button>
        </div>
      ) : (
        <div className="glass-soft divide-hairline overflow-hidden rounded-2xl">
          {people.map((person) => (
            <button
              key={person.key}
              onClick={() => setSelectedKey(person.key)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-[#f0d29a]">
                {person.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white/90">
                  {person.name}
                </span>
                <span className="block text-xs text-white/35">{statusText(person.net)}</span>
              </span>
              <span
                className={`shrink-0 text-sm font-semibold tabular-nums ${
                  person.net > 0
                    ? 'text-[#4ade80]'
                    : person.net < 0
                      ? 'text-[#ff8a80]'
                      : 'text-white/35'
                }`}
              >
                {person.net === 0
                  ? '₹0'
                  : `${person.net > 0 ? '+' : '−'}${formatMoney(Math.abs(person.net))}`}
              </span>
              <ChevronRight size={14} className="shrink-0 text-white/25" />
            </button>
          ))}
        </div>
      )}

      {adding && (
        <Sheet
          onClose={() => {
            setAdding(false)
            setInitialPerson('')
          }}
        >
          <h2 className="mb-1 text-lg font-semibold tracking-tight text-white">
            {initialPerson ? `Add for ${initialPerson}` : 'Add record'}
          </h2>
          <p className="mb-4 text-xs leading-relaxed text-white/45">
            Lending lowers your balance, borrowing raises it. Settlements adjust the difference
            later.
          </p>
          <LoanForm
            initialPerson={initialPerson}
            people={people.map((person) => person.name)}
            onDone={() => {
              setAdding(false)
              setInitialPerson('')
            }}
          />
        </Sheet>
      )}

      {selected && (
        <Sheet onClose={() => setSelectedKey(null)}>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-[#f0d29a]">
              {selected.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold tracking-tight text-white">
                {selected.name}
              </h2>
              <p className="text-xs text-white/45">{statusText(selected.net)}</p>
            </div>
            <p
              className={`shrink-0 text-lg font-semibold tabular-nums ${
                selected.net > 0
                  ? 'text-[#4ade80]'
                  : selected.net < 0
                    ? 'text-[#ff8a80]'
                    : 'text-white/40'
              }`}
            >
              {selected.net === 0
                ? '₹0'
                : `${selected.net > 0 ? '+' : '−'}${formatMoney(Math.abs(selected.net))}`}
            </p>
          </div>

          {selected.net !== 0 && (
            <button
              onClick={() => void settleInFull(selected)}
              className="btn-green mt-3 w-full rounded-xl py-2.5 text-sm font-semibold"
            >
              Settle in full · {formatMoney(Math.abs(selected.net))}
            </button>
          )}

          <SettlementForm key={selected.key} person={selected} />

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                Activity
              </p>
              <button
                onClick={() => startLoanFor(selected.name)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#f0d29a]"
              >
                <Plus size={12} />
                New lend / borrow
              </button>
            </div>

            {activity.length === 0 ? (
              <p className="py-3 text-center text-xs text-white/35">No entries yet.</p>
            ) : (
              <div className="glass-soft divide-hairline overflow-hidden rounded-xl">
                {activity.map((entry) => {
                  if (entry.kind === 'loan') {
                    const { loan } = entry
                    const incoming = loan.direction === 'borrowed'
                    return (
                      <div key={`loan-${loan.id}`} className="flex items-center gap-2.5 px-3 py-2.5">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            incoming
                              ? 'bg-[#30d158]/10 text-[#4ade80]'
                              : 'bg-[#ff453a]/10 text-[#ff8a80]'
                          }`}
                        >
                          {incoming ? (
                            <ArrowDownLeft size={13} />
                          ) : (
                            <ArrowUpRight size={13} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-white/85">
                            {incoming ? 'Borrowed' : 'Lent'}
                            {loan.settled && (
                              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-white/45">
                                settled
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-[10px] text-white/35">
                            {loan.note || formatDayLabel(loan.date)}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 text-xs font-semibold tabular-nums ${
                            incoming ? 'text-[#4ade80]' : 'text-[#ff8a80]'
                          }`}
                        >
                          {incoming ? '+' : '−'}
                          {formatMoney(loan.amount)}
                        </span>
                      </div>
                    )
                  }

                  const { settlement } = entry
                  const received = settlement.direction === 'received'
                  return (
                    <div
                      key={`settlement-${settlement.id}`}
                      className="flex items-center gap-2.5 px-3 py-2.5"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          received
                            ? 'bg-[#30d158]/10 text-[#4ade80]'
                            : 'bg-[#ff453a]/10 text-[#ff8a80]'
                        }`}
                      >
                        {received ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-white/85">
                          {received ? 'Received back' : 'Paid'}
                        </span>
                        <span className="block truncate text-[10px] text-white/35">
                          {settlement.note || formatDayLabel(settlement.date)}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-xs font-semibold tabular-nums ${
                          received ? 'text-[#4ade80]' : 'text-[#ff8a80]'
                        }`}
                      >
                        {received ? '+' : '−'}
                        {formatMoney(settlement.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Sheet>
      )}
    </div>
  )
}
