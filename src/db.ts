import Dexie, { type EntityTable } from 'dexie'
import type { Adjustment, Expense, Income, Loan } from './types'

const db = new Dexie('expense-tracker') as Dexie & {
  expenses: EntityTable<Expense, 'id'>
  incomes: EntityTable<Income, 'id'>
  adjustments: EntityTable<Adjustment, 'id'>
  loans: EntityTable<Loan, 'id'>
}

db.version(1).stores({
  expenses: '++id, date, category, createdAt',
})

db.version(2).stores({
  expenses: '++id, date, category, createdAt',
  incomes: '++id, date, createdAt',
  adjustments: '++id, date, createdAt',
  loans: '++id, date, settled, createdAt',
})

export { db }
