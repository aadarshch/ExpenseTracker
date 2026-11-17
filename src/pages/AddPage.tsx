import { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import IncomeForm from '../components/IncomeForm'

type Props = {
  onSaved: () => void
}

export default function AddPage({ onSaved }: Props) {
  const [mode, setMode] = useState<'expense' | 'income'>('expense')

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Add</h1>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        Expenses and money received
      </p>

      <div className="mb-4 mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
        <button
          onClick={() => setMode('expense')}
          className={`rounded-lg py-2 text-sm font-semibold transition ${
            mode === 'expense'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => setMode('income')}
          className={`rounded-lg py-2 text-sm font-semibold transition ${
            mode === 'income'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Money in
        </button>
      </div>

      {mode === 'expense' ? (
        <ExpenseForm submitLabel="Add expense" onDone={onSaved} />
      ) : (
        <IncomeForm onDone={onSaved} />
      )}
    </div>
  )
}
