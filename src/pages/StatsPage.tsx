import { useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DataTools from '../components/DataTools'
import MonthSwitcher from '../components/MonthSwitcher'
import { CATEGORIES, LOCALE } from '../constants'
import { useLedger } from '../hooks/useLedger'
import { addMonths, formatMoney, monthKey } from '../utils/format'

export default function StatsPage() {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const { expenses, incomes, balance } = useLedger()

  const key = monthKey(month)
  const visible = expenses.filter((expense) => expense.date.startsWith(key))
  const total = visible.reduce((sum, expense) => sum + expense.amount, 0)
  const moneyIn = incomes
    .filter((income) => income.date.startsWith(key))
    .reduce((sum, income) => sum + income.amount, 0)
  const balanceShare = balance > 0 ? (total / balance) * 100 : null

  const byCategory = CATEGORIES.map((category) => ({
    ...category,
    total: visible
      .filter((expense) => expense.category === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }))
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total)

  const trend = Array.from({ length: 6 }, (_, index) => {
    const trendMonth = addMonths(month, index - 5)
    const trendKey = monthKey(trendMonth)
    return {
      label: trendMonth.toLocaleDateString(LOCALE, { month: 'short' }),
      total: expenses
        .filter((expense) => expense.date.startsWith(trendKey))
        .reduce((sum, expense) => sum + expense.amount, 0),
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <MonthSwitcher month={month} onChange={setMonth} />

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Money in
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-[#4ade80]">
            {formatMoney(moneyIn)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Spent
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-white">
            {formatMoney(total)}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Spending index
            </p>
            <p className="mt-0.5 text-[10px] text-white/30">
              Where this month’s money went
            </p>
          </div>
          <p className="text-[10px] font-semibold tabular-nums text-[#f0d29a]">
            {balanceShare === null ? 'No balance' : `${Math.round(balanceShare)}% of balance`}
          </p>
        </div>

        <div className="relative h-52">
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="90%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {byCategory.map((category) => (
                    <Cell key={category.id} fill={category.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/35">
              No spending this month
            </div>
          )}
          {byCategory.length > 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Spent
              </span>
              <span className="truncate text-xl font-semibold tracking-tight tabular-nums text-white">
                {formatMoney(total)}
              </span>
              <span className="mt-0.5 text-[9px] tabular-nums text-white/35">
                {balanceShare === null
                  ? `Balance ${formatMoney(balance)}`
                  : `${Math.round(balanceShare)}% of ${formatMoney(balance)}`}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-3">
          {byCategory.map((category, index) => {
            const percent = total > 0 ? (category.total / total) * 100 : 0
            return (
              <div key={category.id}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-1.5 font-medium text-white/65">
                    <span className="w-4 shrink-0 text-[9px] font-semibold tabular-nums text-white/25">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="truncate">
                      {category.emoji} {category.label}
                    </span>
                  </span>
                  <span className="shrink-0 text-right font-semibold tabular-nums text-white/85">
                    {formatMoney(category.total)}
                    <span className="ml-1 text-[10px] font-medium text-white/35">
                      {Math.round(percent)}%
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: category.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Last 6 months
        </p>
        <div className="mt-2 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'var(--chart-cursor)' }}
                formatter={(value) => formatMoney(Number(value))}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--chart-tooltip-border)',
                  background: 'var(--chart-tooltip-bg)',
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--chart-text)' }}
                itemStyle={{ color: 'var(--chart-text)' }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {trend.map((item, index) => (
                  <Cell
                    key={item.label}
                    fill={index === trend.length - 1 ? '#e8c27a' : 'rgba(232,194,122,0.4)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTools expenses={expenses} />
    </div>
  )
}
