import Dexie, { type EntityTable } from 'dexie'
import type { Expense } from './types'

const db = new Dexie('expense-tracker') as Dexie & {
  expenses: EntityTable<Expense, 'id'>
}

db.version(1).stores({
  expenses: '++id, date, category, createdAt',
})

export { db }
