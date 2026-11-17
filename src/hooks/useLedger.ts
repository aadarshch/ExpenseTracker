import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function useLedger() {
  const data = useLiveQuery(async () => {
    const [expenses, incomes, adjustments, loans] = await Promise.all([
      db.expenses.toArray(),
      db.incomes.toArray(),
      db.adjustments.toArray(),
      db.loans.toArray(),
    ])
    return { expenses, incomes, adjustments, loans }
  }, [])

  const expenses = data?.expenses ?? []
  const incomes = data?.incomes ?? []
  const adjustments = data?.adjustments ?? []
  const loans = data?.loans ?? []

  const balance =
    incomes.reduce((sum, income) => sum + income.amount, 0) -
    expenses.reduce((sum, expense) => sum + expense.amount, 0) +
    adjustments.reduce((sum, adjustment) => sum + adjustment.amount, 0) +
    loans.reduce((sum, loan) => {
      if (loan.settled) return sum
      return sum + (loan.direction === 'borrowed' ? loan.amount : -loan.amount)
    }, 0)

  return { ready: data !== undefined, expenses, incomes, adjustments, loans, balance }
}
