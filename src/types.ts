import type { CategoryId } from './constants'

export interface Expense {
  id?: number
  // Stored in minor units (paise/cents) as an integer to avoid float drift.
  amount: number
  category: CategoryId
  note: string
  date: string
  createdAt: number
}
