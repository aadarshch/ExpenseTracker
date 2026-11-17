import ExpenseForm from '../components/ExpenseForm'

type Props = {
  onSaved: () => void
}

export default function AddPage({ onSaved }: Props) {
  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">Add expense</h1>
      <p className="mb-4 mt-0.5 text-sm text-slate-500">
        Stays on your device — no account needed.
      </p>
      <ExpenseForm submitLabel="Add expense" onDone={onSaved} />
    </div>
  )
}
