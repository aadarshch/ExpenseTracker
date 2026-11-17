import type { CategoryId } from './constants'

export interface Expense {
  id?: number
  // Money amounts are stored in minor units (paise/cents) as integers to avoid float drift.
  amount: number
  category: CategoryId
  note: string
  date: string
  createdAt: number
}

export interface Income {
  id?: number
  amount: number
  source: string
  note: string
  date: string
  createdAt: number
}

export interface Adjustment {
  id?: number
  // Signed delta in minor units; used to sync the computed balance with the real bank balance.
  amount: number
  note: string
  date: string
  createdAt: number
}

export type LoanDirection = 'lent' | 'borrowed'

export interface Loan {
  id?: number
  person: string
  direction: LoanDirection
  amount: number
  note: string
  date: string
  settled: boolean
  settledAt?: number
  createdAt: number
}

export type SettlementDirection = 'received' | 'paid'

export interface Settlement {
  id?: number
  person: string
  // received: the person paid me back. paid: I paid the person back.
  direction: SettlementDirection
  amount: number
  note: string
  date: string
  createdAt: number
}
