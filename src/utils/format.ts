import { CURRENCY, LOCALE } from '../constants'

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
})

export const formatMoney = (minorUnits: number) => money.format(minorUnits / 100)

export function parseAmount(input: string): number | null {
  if (!/^\d+(?:\.\d{0,2})?$/.test(input)) return null
  const minorUnits = Math.round(Number(input) * 100)
  return minorUnits > 0 ? minorUnits : null
}

export const toISODate = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export const todayISO = () => toISODate(new Date())

export function formatDayLabel(iso: string) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (iso === todayISO()) return 'Today'
  if (iso === toISODate(yesterday)) return 'Yesterday'
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export const monthLabel = (date: Date) =>
  date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

export const addMonths = (date: Date, delta: number) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1)
