import { db } from '../db'
import type { Adjustment, Expense, Income, Loan, Settlement } from '../types'

export interface Backup {
  app: 'expense-tracker'
  version: 3
  exportedAt: string
  expenses: Expense[]
  incomes: Income[]
  adjustments: Adjustment[]
  loans: Loan[]
  settlements: Settlement[]
}

export async function createBackup(): Promise<Backup> {
  const [expenses, incomes, adjustments, loans, settlements] = await Promise.all([
    db.expenses.toArray(),
    db.incomes.toArray(),
    db.adjustments.toArray(),
    db.loans.toArray(),
    db.settlements.toArray(),
  ])
  return {
    app: 'expense-tracker',
    version: 3,
    exportedAt: new Date().toISOString(),
    expenses,
    incomes,
    adjustments,
    loans,
    settlements,
  }
}

export function downloadBackup(backup: Backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function restoreBackup(text: string): Promise<void> {
  const data = JSON.parse(text) as Partial<Backup>
  if (data.app !== 'expense-tracker' || !Array.isArray(data.expenses)) {
    throw new Error('This file is not an Expense Tracker backup.')
  }

  const expenses = data.expenses
  const incomes = Array.isArray(data.incomes) ? data.incomes : []
  const adjustments = Array.isArray(data.adjustments) ? data.adjustments : []
  const loans = Array.isArray(data.loans) ? data.loans : []
  const settlements = Array.isArray(data.settlements) ? data.settlements : []

  await db.transaction(
    'rw',
    db.expenses,
    db.incomes,
    db.adjustments,
    db.loans,
    db.settlements,
    async () => {
      await Promise.all([
        db.expenses.clear(),
        db.incomes.clear(),
        db.adjustments.clear(),
        db.loans.clear(),
        db.settlements.clear(),
      ])
      await db.expenses.bulkAdd(expenses)
      if (incomes.length > 0) await db.incomes.bulkAdd(incomes)
      if (adjustments.length > 0) await db.adjustments.bulkAdd(adjustments)
      if (loans.length > 0) await db.loans.bulkAdd(loans)
      if (settlements.length > 0) await db.settlements.bulkAdd(settlements)
    },
  )
}

export async function clearAllData() {
  await db.transaction(
    'rw',
    db.expenses,
    db.incomes,
    db.adjustments,
    db.loans,
    db.settlements,
    async () => {
      await Promise.all([
        db.expenses.clear(),
        db.incomes.clear(),
        db.adjustments.clear(),
        db.loans.clear(),
        db.settlements.clear(),
      ])
    },
  )
}
