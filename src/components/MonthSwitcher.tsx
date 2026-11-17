import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, monthLabel, startOfMonth } from '../utils/format'

type Props = {
  month: Date
  onChange: (month: Date) => void
}

export default function MonthSwitcher({ month, onChange }: Props) {
  const canGoNext = month.getTime() < startOfMonth(new Date()).getTime()

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onChange(addMonths(month, -1))}
        aria-label="Previous month"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition active:scale-95"
      >
        <ChevronLeft size={16} />
      </button>
      <p className="text-base font-semibold tracking-tight text-slate-900">{monthLabel(month)}</p>
      <button
        onClick={() => onChange(addMonths(month, 1))}
        disabled={!canGoNext}
        aria-label="Next month"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition active:scale-95 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
