import { Pencil, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { CURRENCY_SYMBOL } from '../constants'
import { db } from '../db'
import { formatMoney, parseBalanceTarget, todayISO } from '../utils/format'
import AmountCalculator from './AmountCalculator'
import Sheet from './Sheet'

type Props = {
  balance: number
  spentThisMonth: number
  ready: boolean
  showInsight?: boolean
}

type Burst = { id: number; type: 'coin' | 'cash' }

const COIN_BITS = [
  { dx: -34, dy: -58, delay: 0, size: 15, spin: '340deg' },
  { dx: 22, dy: -66, delay: 80, size: 17, spin: '-300deg' },
  { dx: -12, dy: -82, delay: 150, size: 13, spin: '420deg' },
  { dx: 38, dy: -48, delay: 220, size: 14, spin: '-380deg' },
  { dx: -44, dy: -42, delay: 280, size: 12, spin: '300deg' },
  { dx: 6, dy: -92, delay: 340, size: 16, spin: '-460deg' },
] as const

const CASH_BITS = [
  { dx: -46, dy: -52, delay: 0, rot: '-14deg', spin: '-40deg' },
  { dx: 34, dy: -64, delay: 60, rot: '10deg', spin: '50deg' },
  { dx: -18, dy: -86, delay: 120, rot: '6deg', spin: '-30deg' },
  { dx: 52, dy: -44, delay: 180, rot: '-20deg', spin: '45deg' },
  { dx: 4, dy: -98, delay: 240, rot: '16deg', spin: '-55deg' },
] as const

export default function BalanceCard({ balance, spentThisMonth, ready, showInsight = false }: Props) {
  const [editing, setEditing] = useState(false)
  const [target, setTarget] = useState('')
  const [error, setError] = useState('')
  const [burst, setBurst] = useState<Burst | null>(null)

  const prevBalance = useRef(balance)
  const seeded = useRef(false)
  const burstId = useRef(0)

  useEffect(() => {
    if (!ready) return
    if (!seeded.current) {
      seeded.current = true
      prevBalance.current = balance
      return
    }
    const previous = prevBalance.current
    if (previous === balance) return
    prevBalance.current = balance
    burstId.current += 1
    setBurst({ id: burstId.current, type: balance > previous ? 'coin' : 'cash' })
  }, [balance, ready])

  useEffect(() => {
    if (!burst) return
    const timer = setTimeout(() => setBurst(null), 1600)
    return () => clearTimeout(timer)
  }, [burst])

  const burning =
    ready &&
    (balance < 0 || (spentThisMonth > 0 && spentThisMonth * 2 > Math.max(balance, 0)))

  const insight = !ready
    ? 'Reading your ledger…'
    : balance < 0
      ? 'Balance is below zero. Add money in or match it to your bank.'
      : balance === 0
        ? spentThisMonth > 0
          ? `Balance is empty and you've spent ${formatMoney(spentThisMonth)} this month.`
          : 'No balance yet. Add money in when you receive it.'
        : burning
          ? `You've spent ${formatMoney(spentThisMonth)} this month — more than half your remaining balance.`
          : spentThisMonth > 0
            ? `You've spent ${formatMoney(spentThisMonth)} this month — under half your balance.`
            : "No spending yet this month. You're all set."

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
      <div
        className={`relative rounded-2xl border px-3.5 py-2.5 backdrop-blur-xl ${
          burning
            ? 'border-[#ff453a]/20 bg-[#ff453a]/[0.05]'
            : 'border-white/[0.08] bg-white/[0.035]'
        }`}
      >
        {burning && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <span className="ember-glow" aria-hidden="true" />
          </span>
        )}

        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Current balance
            </p>

            <div className="relative mt-0.5 inline-block">
              <p
                className={`text-[1.6rem] font-semibold leading-tight tracking-tight tabular-nums ${
                  burning ? 'balance-burning' : balance < 0 ? 'text-[#ff8a80]' : 'text-white'
                }`}
              >
                {formatMoney(balance)}
              </p>

              {burst && (
                <span
                  key={burst.id}
                  className="pointer-events-none absolute inset-0 overflow-visible"
                  aria-hidden="true"
                >
                  {burst.type === 'coin'
                    ? COIN_BITS.map((bit, index) => (
                        <span
                          key={index}
                          className="coin"
                          style={
                            {
                              '--dx': `${bit.dx}px`,
                              '--dy': `${bit.dy}px`,
                              '--delay': `${bit.delay}ms`,
                              '--spin': bit.spin,
                              width: bit.size,
                              height: bit.size,
                              fontSize: 9,
                            } as CSSProperties
                          }
                        >
                          ₹
                        </span>
                      ))
                    : CASH_BITS.map((bit, index) => (
                        <span
                          key={index}
                          className="note-bill"
                          style={
                            {
                              '--dx': `${bit.dx}px`,
                              '--dy': `${bit.dy}px`,
                              '--delay': `${bit.delay}ms`,
                              '--rot': bit.rot,
                              '--spin': bit.spin,
                            } as CSSProperties
                          }
                        >
                          ₹
                        </span>
                      ))}
                </span>
              )}
            </div>

            {showInsight && (
              <p className="mt-1 flex items-center gap-1 text-[10px] leading-snug text-white/40">
                <Sparkles size={10} className="shrink-0 text-[#e8c27a]/80" />
                <span className="truncate">{insight}</span>
              </p>
            )}
          </div>

          <button
            onClick={openEditor}
            aria-label="Edit balance"
            className="icon-btn h-9 w-9 shrink-0"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>

      {editing && (
        <Sheet onClose={() => setEditing(false)}>
          <h2 className="text-lg font-semibold tracking-tight text-white">Set current balance</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/45">
            Enter the real balance from your bank or wallet — the app records a one-time
            adjustment.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div className="field rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                  Amount
                </span>
                <AmountCalculator value={target} onApply={handleTarget} />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-white/35">{CURRENCY_SYMBOL}</span>
                <input
                  autoFocus
                  value={target}
                  onChange={(event) => handleTarget(event.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  autoComplete="off"
                  className="w-full bg-transparent text-4xl font-semibold tracking-tight text-white outline-none placeholder:text-white/15"
                />
              </div>
              {error && <p className="mt-1 text-xs font-medium text-[#ff8a80]">{error}</p>}
            </div>
            <button
              type="submit"
              className="btn-gold w-full rounded-xl py-3.5 text-sm font-semibold"
            >
              Update balance
            </button>
          </form>
        </Sheet>
      )}
    </>
  )
}
