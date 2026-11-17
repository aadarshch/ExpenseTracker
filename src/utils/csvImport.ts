import { CATEGORIES } from '../constants'
import { db } from '../db'
import type { Expense } from '../types'

export interface ImportResult {
  imported: number
  skipped: number
  error: string | null
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

export async function importExpensesCsv(text: string): Promise<ImportResult> {
  const rows = parseCsv(text.replace(/^\uFEFF/, ''))
  if (rows.length < 2) return { imported: 0, skipped: 0, error: 'The file is empty.' }

  const header = rows[0].map((cell) => cell.trim().toLowerCase())
  const dateIndex = header.indexOf('date')
  const categoryIndex = header.indexOf('category')
  const noteIndex = header.indexOf('note')
  const amountIndex = header.indexOf('amount')

  if (dateIndex < 0 || amountIndex < 0 || categoryIndex < 0) {
    return {
      imported: 0,
      skipped: 0,
      error: 'Unrecognized CSV. Expected columns: Date, Category, Note, Amount.',
    }
  }

  const existing = await db.expenses.toArray()
  const seen = new Set(
    existing.map(
      (expense) =>
        `${expense.date}|${expense.amount}|${expense.category}|${expense.note.trim().toLowerCase()}`,
    ),
  )

  const toAdd: Expense[] = []
  let skipped = 0

  for (const row of rows.slice(1)) {
    if (row.every((cell) => cell.trim() === '')) continue

    const date = (row[dateIndex] ?? '').trim()
    const amountRaw = (row[amountIndex] ?? '').trim()
    const categoryLabel = (row[categoryIndex] ?? '').trim().toLowerCase()
    const note = noteIndex >= 0 ? (row[noteIndex] ?? '').trim() : ''

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d+(?:\.\d{1,2})?$/.test(amountRaw)) {
      skipped++
      continue
    }

    const amount = Math.round(Number(amountRaw) * 100)
    if (amount <= 0) {
      skipped++
      continue
    }

    const category =
      CATEGORIES.find((option) => option.label.toLowerCase() === categoryLabel)?.id ?? 'other'
    const key = `${date}|${amount}|${category}|${note.toLowerCase()}`
    if (seen.has(key)) {
      skipped++
      continue
    }

    seen.add(key)
    toAdd.push({ date, amount, category, note, createdAt: Date.now() + toAdd.length })
  }

  if (toAdd.length > 0) await db.expenses.bulkAdd(toAdd)

  return { imported: toAdd.length, skipped, error: null }
}
