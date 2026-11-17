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
  const { expenses, incomes } = useLedger()

  const key = monthKey(month)
  const visible = expenses.filter((expense) => expense.date.startsWith(key))
  const total = visible.reduce((sum, expense) => sum + expense.amount, 0)
  const moneyIn = incomes
    .filter((income) => income.date.startsWith(key))
    .reduce((sum, income) => sum + income.amount, 0)

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
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Money in
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatMoney(moneyIn)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Spent
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {formatMoney(total)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="relative h-52">
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="label"
                  innerRadius="68%"
                  outerRadius="92%"
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
            <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
              No spending this month
            </div>
          )}
          {byCategory.length > 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Total
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatMoney(total)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-3">
          {byCategory.map((category) => {
            const percent = total > 0 ? (category.total / total) * 100 : 0
            return (
              <div key={category.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.emoji} {category.label}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {formatMoney(category.total)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Last 6 months
        </p>
        <div className="mt-2 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
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
                    fill={index === trend.length - 1 ? '#4f46e5' : '#818cf8'}
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
