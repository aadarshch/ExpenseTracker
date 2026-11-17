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
      <div className="segmented mb-4">
        <button
          onClick={() => setMode('expense')}
          className={`segmented-btn ${mode === 'expense' ? 'segmented-btn-active' : ''}`}
        >
          Expense
        </button>
        <button
          onClick={() => setMode('income')}
          className={`segmented-btn ${mode === 'income' ? 'segmented-btn-active' : ''}`}
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
