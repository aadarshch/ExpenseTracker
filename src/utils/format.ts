import { CURRENCY, CURRENCY_SYMBOL, LOCALE } from '../constants'

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
})

export const formatMoney = (minorUnits: number) => money.format(minorUnits / 100)

export function formatCompactMoney(minorUnits: number) {
  const rupees = minorUnits / 100
  const abs = Math.abs(rupees)
  const sign = rupees < 0 ? '−' : ''
  if (abs >= 1_00_00_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 1_00_00_000).toFixed(abs >= 10_00_00_000 ? 0 : 1)}Cr`
  }
  if (abs >= 1_00_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 1_00_000).toFixed(abs >= 10_00_000 ? 0 : 1)}L`
  }
  if (abs >= 1_000) {
    return `${sign}${CURRENCY_SYMBOL}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`
  }
  return `${sign}${CURRENCY_SYMBOL}${Math.round(abs)}`
}

export function parseAmount(input: string): number | null {
  if (!/^\d+(?:\.\d{0,2})?$/.test(input)) return null
  const minorUnits = Math.round(Number(input) * 100)
  return minorUnits > 0 ? minorUnits : null
}

export function parseBalanceTarget(input: string): number | null {
  if (!/^-?\d+(?:\.\d{0,2})?$/.test(input)) return null
  return Math.round(Number(input) * 100)
}

export const toISODate = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export const todayISO = () => toISODate(new Date())

export function parseISODate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatShortDate(iso: string) {
  return parseISODate(iso).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

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
