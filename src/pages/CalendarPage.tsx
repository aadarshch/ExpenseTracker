import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import MonthSwitcher from '../components/MonthSwitcher'
import Sheet from '../components/Sheet'
import { categoryById } from '../constants'
import { useLedger } from '../hooks/useLedger'
import {
  formatCompactMoney,
  formatDayLabel,
  formatMoney,
  monthKey,
  startOfMonth,
  todayISO,
} from '../utils/format'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [today] = useState(todayISO)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { expenses, incomes } = useLedger()

  const key = monthKey(month)
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

  const spendByDay = new Map<number, number>()
  const earnByDay = new Map<number, number>()
  for (const expense of expenses) {
    if (!expense.date.startsWith(key)) continue
    const day = Number(expense.date.slice(8, 10))
    spendByDay.set(day, (spendByDay.get(day) ?? 0) + expense.amount)
  }
  for (const income of incomes) {
    if (!income.date.startsWith(key)) continue
    const day = Number(income.date.slice(8, 10))
    earnByDay.set(day, (earnByDay.get(day) ?? 0) + income.amount)
  }

  const monthSpent = [...spendByDay.values()].reduce((sum, value) => sum + value, 0)
  const monthEarned = [...earnByDay.values()].reduce((sum, value) => sum + value, 0)

  const dayExpenses = selectedDate
    ? expenses.filter((expense) => expense.date === selectedDate)
    : []
  const dayIncomes = selectedDate
    ? incomes.filter((income) => income.date === selectedDate)
    : []
  const daySpent = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const dayEarned = dayIncomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white">Calendar</h1>
        <p className="mt-0.5 text-sm text-white/45">Spent and earned, day by day</p>
      </div>

      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Spent
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-white">
            {formatMoney(monthSpent)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Earned
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-[#4ade80]">
            {formatMoney(monthEarned)}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-3">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((label, index) => (
            <div
              key={`${label}-${index}`}
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white/30"
            >
              {label}
            </div>
          ))}

          {Array.from({ length: firstWeekday }, (_, index) => (
            <div key={`pad-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const iso = `${key}-${String(day).padStart(2, '0')}`
            const spent = spendByDay.get(day) ?? 0
            const earned = earnByDay.get(day) ?? 0
            const hasData = spent > 0 || earned > 0
            const isToday = iso === today
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(iso)}
                className={`relative flex h-[54px] flex-col items-center justify-center rounded-xl border text-center transition active:scale-[0.97] ${
                  hasData
                    ? 'border-white/10 bg-white/[0.045]'
                    : 'border-white/[0.04] bg-white/[0.015]'
                } ${isToday ? 'ring-1 ring-[#e8c27a]/60' : ''}`}
              >
                <span
                  className={`text-[11px] font-semibold leading-none ${
                    isToday ? 'text-[#f0d29a]' : hasData ? 'text-white/85' : 'text-white/35'
                  }`}
                >
                  {day}
                </span>
                {spent > 0 ? (
                  <span className="mt-0.5 text-[8.5px] font-semibold leading-none tabular-nums text-white/55">
                    {formatCompactMoney(spent)}
                  </span>
                ) : (
                  <span className="h-[9px]" />
                )}
                {earned > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#30d158]" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/35">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
            money in
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            spending shown per day
          </span>
        </div>
      </div>

      {monthSpent === 0 && monthEarned === 0 && (
        <div className="glass-dashed flex flex-col items-center gap-2 rounded-2xl px-6 py-8 text-center">
          <CalendarDays size={22} className="text-white/30" />
          <p className="text-xs text-white/40">Nothing recorded this month yet.</p>
        </div>
      )}

      {selectedDate && (
        <Sheet onClose={() => setSelectedDate(null)} translucent>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              {formatDayLabel(selectedDate)}
            </h2>
            <p className="text-[11px] tabular-nums text-white/30">{selectedDate}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="glass-soft rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                Spent
              </p>
              <p className="text-sm font-semibold tabular-nums text-white">{formatMoney(daySpent)}</p>
            </div>
            <div className="glass-soft rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                Earned
              </p>
              <p className="text-sm font-semibold tabular-nums text-[#4ade80]">
                {formatMoney(dayEarned)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {dayIncomes.length > 0 && (
              <section>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Money in
                </p>
                <div className="glass-soft divide-hairline overflow-hidden rounded-xl">
                  {dayIncomes.map((income) => (
                    <div
                      key={income.id ?? `${income.date}-${income.createdAt}`}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-white/85">
                          {income.source || 'Money in'}
                        </span>
                        {income.note && (
                          <span className="block truncate text-[11px] text-white/35">
                            {income.note}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-[#4ade80]">
                        +{formatMoney(income.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dayExpenses.length > 0 && (
              <section>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Spent
                </p>
                <div className="glass-soft divide-hairline overflow-hidden rounded-xl">
                  {dayExpenses.map((expense) => {
                    const category = categoryById(expense.category)
                    return (
                      <div
                        key={expense.id ?? `${expense.date}-${expense.createdAt}`}
                        className="flex items-center gap-2.5 px-3 py-2.5"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                          style={{ backgroundColor: `${category.color}22` }}
                        >
                          {category.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-white/85">
                            {category.label}
                          </span>
                          {expense.note && (
                            <span className="block truncate text-[11px] text-white/35">
                              {expense.note}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-white/85">
                          {formatMoney(expense.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {dayIncomes.length === 0 && dayExpenses.length === 0 && (
              <p className="py-4 text-center text-xs text-white/35">
                Nothing recorded on this day.
              </p>
            )}
          </div>
        </Sheet>
      )}
    </div>
  )
}
