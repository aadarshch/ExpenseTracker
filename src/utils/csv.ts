import { CURRENCY, categoryById } from '../constants'
import type { Expense } from '../types'

export function exportExpensesCsv(expenses: Expense[]) {
  const header = ['Date', 'Category', 'Note', 'Amount', 'Currency']
  const lines = [
    header,
    ...expenses.map((expense) => [
      expense.date,
      categoryById(expense.category).label,
      expense.note,
      (expense.amount / 100).toFixed(2),
      CURRENCY,
    ]),
  ]
  const csv = lines
    .map((columns) => columns.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  // BOM so Excel opens the file with correct encoding
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
