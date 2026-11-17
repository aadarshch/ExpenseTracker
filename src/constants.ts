export const LOCALE = 'en-IN'
export const CURRENCY = 'INR'

export const CURRENCY_SYMBOL =
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value ?? CURRENCY

export const CATEGORIES = [
  { id: 'food', label: 'Food', emoji: '🍔', color: '#f97316' },
  { id: 'transport', label: 'Transport', emoji: '🚕', color: '#3b82f6' },
  { id: 'bills', label: 'Bills', emoji: '🧾', color: '#8b5cf6' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ec4899' },
  { id: 'health', label: 'Health', emoji: '💊', color: '#10b981' },
  { id: 'fun', label: 'Fun', emoji: '🎉', color: '#eab308' },
  { id: 'education', label: 'Education', emoji: '📚', color: '#06b6d4' },
  { id: 'other', label: 'Other', emoji: '📦', color: '#64748b' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export function categoryById(id: CategoryId) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
