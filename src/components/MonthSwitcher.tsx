import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { addMonths, monthLabel, startOfMonth } from '../utils/format'

type Props = {
  month: Date
  onChange: (month: Date) => void
}

export default function MonthSwitcher({ month, onChange }: Props) {
  const [thisMonth] = useState(() => startOfMonth(new Date()).getTime())
  const canGoNext = month.getTime() < thisMonth

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onChange(addMonths(month, -1))}
        aria-label="Previous month"
        className="icon-btn"
      >
        <ChevronLeft size={16} />
      </button>
      <p className="text-[15px] font-semibold tracking-tight text-white">{monthLabel(month)}</p>
      <button
        onClick={() => onChange(addMonths(month, 1))}
        disabled={!canGoNext}
        aria-label="Next month"
        className="icon-btn disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
