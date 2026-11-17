import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  addMonths,
  formatShortDate,
  monthKey,
  monthLabel,
  parseISODate,
  startOfMonth,
  todayISO,
} from '../utils/format'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type Props = {
  value: string
  onChange: (iso: string) => void
  label?: string
}

export default function DatePicker({ value, onChange, label = 'Date' }: Props) {
  const [open, setOpen] = useState(false)
  const [today] = useState(todayISO)
  const [month, setMonth] = useState(() => startOfMonth(parseISODate(value)))

  const openPicker = () => {
    setMonth(startOfMonth(parseISODate(value)))
    setOpen(true)
  }

  const select = (iso: string) => {
    onChange(iso)
    setOpen(false)
  }

  const key = monthKey(month)
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const canGoNext =
    month.getTime() < startOfMonth(parseISODate(today)).getTime()

  return (
    <>
      <button type="button" onClick={openPicker} className="field w-full rounded-xl px-3 py-2 text-left">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/35">
          {label}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-white">
          <CalendarDays size={13} className="shrink-0 text-white/35" />
          {formatShortDate(value)}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <div
              className="sheet-panel w-full max-w-md rounded-t-[1.75rem] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setMonth(addMonths(month, -1))}
                  aria-label="Previous month"
                  className="icon-btn h-8 w-8"
                >
                  <ChevronLeft size={15} />
                </button>
                <p className="text-sm font-semibold tracking-tight text-white">{monthLabel(month)}</p>
                <button
                  onClick={() => setMonth(addMonths(month, 1))}
                  disabled={!canGoNext}
                  aria-label="Next month"
                  className="icon-btn h-8 w-8 disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((weekday, index) => (
                  <div
                    key={`${weekday}-${index}`}
                    className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white/30"
                  >
                    {weekday}
                  </div>
                ))}

                {Array.from({ length: firstWeekday }, (_, index) => (
                  <div key={`pad-${index}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
                  const iso = `${key}-${String(day).padStart(2, '0')}`
                  const selected = iso === value
                  const isToday = iso === today
                  return (
                    <button
                      key={day}
                      onClick={() => select(iso)}
                      className={`flex h-10 items-center justify-center rounded-lg text-[13px] font-semibold tabular-nums transition ${
                        selected
                          ? 'bg-[#e8c27a] text-[#1a1408]'
                          : isToday
                            ? 'border border-[#e8c27a]/50 text-[#f0d29a]'
                            : 'border border-transparent text-white/70 active:bg-white/10'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => select(today)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold text-white/70"
                >
                  Today
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-1.5 text-[11px] font-semibold text-white/45"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
